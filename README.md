# Numera — Results & Statistics Portal

A results and statistics portal: a live board of today's published values, a
filterable archive going back 60 days, and descriptive statistics over that
archive.

**This is a demonstration build.** Every category, schedule and value is
fictional, generated data. There is no betting, wagering, payment or prediction
functionality, and the statistics pages describe past data only.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional; defaults work out of the box
npm run dev                    # http://localhost:3000
```

| Command            | What it does                                                  |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Development server                                             |
| `npm run build`    | Production build                                               |
| `npm start`        | Serve the production build                                     |
| `npm run lint`     | ESLint                                                         |
| `npm run typecheck`| `tsc --noEmit`                                                 |
| `npm test`         | Builds nothing — starts the built app on port 3199 and runs the end-to-end suite. Run `npm run build` first. |

To test against a server you already have running:

```bash
TEST_BASE_URL=http://localhost:3000 npm test
```

## Stack

| Concern    | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19        |
| Language   | TypeScript, strict                       |
| Styling    | Tailwind CSS 4, design tokens in `globals.css` |
| Icons      | lucide-react                             |
| Charts     | Recharts                                 |
| Validation | Zod                                      |
| Forms      | React Hook Form (the filter panel)       |
| Tests      | `node:test` + `fetch`, no framework      |

## Architecture

```
Browser
   ↓
Pages (server components)          Public JSON API (route handlers)
   ↓                                          ↓
             Service layer  (src/lib/services)
                          ↓
             Data layer    (src/lib/data)   ← swap for a database
```

The **service layer is the only way to reach data**. Pages and API routes both
call it; neither touches the generator directly. Replacing the demo data with
PostgreSQL means reimplementing `src/lib/data/results.ts` — the services, the
API and every page stay as they are.

Filters, sorting and pagination live **in the URL**, not in component state, so
every view is shareable, refresh-safe and rendered on the server.

```
src/
  app/                    routes; each page is a server component
    api/                  read-only JSON API
    (page)/loading.tsx    skeletons
    error.tsx not-found.tsx robots.ts sitemap.ts
  components/
    layout/               header (mobile menu), footer, page shell, clock
    results/              result & category cards, auto-refresh
    tables/               responsive results table
    filters/              filter panel (React Hook Form → URL)
    charts/               Recharts wrappers with screen-reader tables
    ui/                   primitives: card, badge, button, states, pagination
  lib/
    data/                 the demo dataset (the only place data is invented)
    services/             queries: results, categories, statistics, query schema
    api/                  HTTP envelope, error shape, query validation
    utils/                formatting
  types/                  shared domain types
tests/                    end-to-end API + page suite
```

## Data model

```
Category ──< Result
```

| Category         |                                                  |
| ---------------- | ------------------------------------------------ |
| `id`, `slug`     | identity                                          |
| `name`           | display name                                      |
| `description`    | prose shown on the category page                  |
| `scheduleTime`   | 24h `HH:MM` daily slot                            |
| `group`          | `day` \| `night` \| `special`                     |
| `status`         | `active` \| `paused`                              |
| `updateFrequency`| `Daily` \| `Weekdays` \| `Paused`                 |
| `accent`         | 1–6, maps to a chart colour token                 |

| Result           |                                                  |
| ---------------- | ------------------------------------------------ |
| `id`             | `{categorySlug}_{date}`                           |
| `categoryId`     | owning category                                   |
| `date`           | `YYYY-MM-DD`                                      |
| `value`          | `"00"`–`"99"`, or `null` until published          |
| `status`         | `published` \| `pending` \| `scheduled`           |
| `publishedAt`    | ISO timestamp, `null` until published             |
| `updatedAt`      | ISO timestamp                                     |

`categorySlug` / `categoryName` are denormalised onto each result so the UI can
render a row without a join; a relational backend would join instead.

**Statuses.** `scheduled` — the slot is still in the future. `pending` — the
slot has passed but nothing is published. `published` — a value and a timestamp
exist.

**How values are generated.** A seeded PRNG keyed on `(category, date)`, so the
archive is reproducible: the same date always yields the same value, on every
process. Today's statuses still advance as the clock passes each slot. The
dataset is rebuilt at most once a minute.

## API

Read-only JSON. Every response is `{ data, meta }`; every error is
`{ error: { code, message, details? } }`.

| Endpoint                  | Notes                                              |
| ------------------------- | -------------------------------------------------- |
| `GET /api/categories`     | `?search= &status=active|paused &group= &summary=true` |
| `GET /api/categories/:slug` | Category, latest value, counts, last 30 entries   |
| `GET /api/results`        | The full query set (below)                          |
| `GET /api/results/:id`    | One entry with its category                         |
| `GET /api/history`        | As `/api/results`, plus archive coverage in `meta`  |
| `GET /api/statistics`     | `?category= &days=7..60`                            |

Query parameters for `/api/results` and `/api/history`:

| Param                  | Type                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `category`             | slug                                                          |
| `group`                | `day` \| `night` \| `special`                                  |
| `date`                 | `YYYY-MM-DD`                                                  |
| `startDate`, `endDate` | `YYYY-MM-DD`                                                  |
| `search`               | matches category name, slug, date or value                    |
| `status`               | `published` \| `pending` \| `scheduled`                       |
| `sort`                 | `date_desc` (default), `date_asc`, `value_desc`, `value_asc`, `category_asc` |
| `page`                 | ≥ 1, default 1 (a page past the end returns the last page)    |
| `limit`                | 1–100, default 20                                             |

```bash
curl 'http://localhost:3000/api/results?category=alpha-market&sort=value_asc&limit=5'
curl 'http://localhost:3000/api/statistics?days=7'
```

Invalid parameters return `400` listing **every** offending field:

```json
{"error":{"code":"invalid_query","message":"One or more query parameters are invalid",
  "details":[{"field":"page","message":"Too small: expected number to be >=1"}]}}
```

Pages are deliberately more forgiving: a hand-edited URL drops the bad
parameter and renders rather than erroring.

## Pages

| Route                  | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `/`                    | Dashboard: summary tiles, today's board, recent entries, markets   |
| `/results`             | Live results grouped Day / Night / Special (`?group=`), plus the full schedule; auto-refreshes |
| `/categories`          | All 18 markets, grouped, filterable by name                       |
| `/categories/[slug]`   | Current value, key numbers, two charts, the market's own archive   |
| `/charts`              | Month calendar of one market's values, and a 10×10 value-frequency grid |
| `/history`             | The full archive: filters, sorting, pagination                    |
| `/statistics`          | Five charts, scoped by market and time window                     |
| `/search`              | Search markets, dates and values                                  |
| `/about`               | What the site is, what it is not, how the data is made            |
| `/faqs`                | Native `<details>` accordion — no JavaScript                      |
| `/disclaimer`          | Scope and limits of the data and statistics                       |

## Notes on the implementation

- **Mobile-first.** Phones are the primary target. Layouts start at 320px and
  add columns upward: stat tiles are 2-up from 320px, result cards go 1 → 2
  (380px) → 4 (1024px), category cards 1 → 2 → 4. The archive table becomes
  cards below `md` with a horizontally scrollable sort bar; wide tables live in
  `scroll-x` containers so a narrow tablet scrolls the table, never the page.
  The filter panel collapses behind a disclosure below `lg` and pairs the date
  fields on one row. Form controls are 44px tall with 16px text — anything
  smaller makes iOS zoom the viewport on focus. Navigation is a 56px bar with a
  scroll-locking menu sheet below `lg`.
- **No `overflow-x: hidden`.** Overflow is measured, not hidden. See the audit
  note below.
- **Accessibility.** One `h1` per page, semantic tables with `<caption>` and
  `aria-sort`, labelled form controls, a single global focus ring, a skip link,
  `role="status"` on result counts and update stamps, and a screen-reader table
  behind every chart. Reduced motion is respected globally.
- **SEO.** Per-page titles, descriptions, canonicals and Open Graph tags;
  `sitemap.xml` and `robots.txt` are generated. `/search` and `/api/*` are
  excluded from indexing.
- **Performance.** Everything is a server component except the header menu, the
  clock, the filter panel, the auto-refresh control and the charts. API
  responses carry a short `s-maxage` so repeat traffic skips the render path.

## Responsive audit

Layout was verified by measurement, not by eye. `tools/viewport-audit.html` loads every
page into a same-origin iframe at 320 / 360 / 375 / 390 / 414 / 430 / 768 / 1024
/ 1440px and compared `documentElement.scrollWidth` against the frame width,
reporting the outermost offending element and any interactive control under
32px. Eleven paths came back clean at all nine widths.

To re-run it: `cp tools/viewport-audit.html public/__viewport.html`, build,
start, open `/__viewport.html`, then delete it again — it must not ship.

The one bug it caught is worth knowing about: `sr-only` on a `<table>` does not
constrain it. A table treats `width: 1px` as a minimum and expands to its
content regardless of `overflow: hidden`, so the screen-reader data tables
behind the charts were pushing the page 160px wide at 320px. The class belongs
on a wrapping `<div>`. `tests/api.test.mjs` guards against it coming back.

Two deliberate exceptions to the 44px touch target: breadcrumb links and inline
table links are 32px. WCAG 2.2 AA requires 24×24 for dense inline navigation;
44px breadcrumbs would dominate the top of every page.

## Known issue

Unknown category URLs (`/categories/does-not-exist`) render the not-found page
correctly but return **HTTP 200 instead of 404** — a soft 404. `notFound()`
cannot set the status once the route has begun streaming its response. The
failing test (`404s an unknown category page`) is left in place rather than
weakened. Ruled out so far: the `loading.tsx` boundary, `next/dynamic` chart
imports, and `dynamicParams = false` at the routing layer. The root `/zzz` 404
works correctly, so this is specific to this route segment. Next step would be
bisecting the page's component tree for whatever introduces the streaming
boundary.

## Deployment

Any Node host: `npm run build && npm start`. Set `NEXT_PUBLIC_SITE_URL` to the
public origin so canonicals, Open Graph URLs and the sitemap are correct.
