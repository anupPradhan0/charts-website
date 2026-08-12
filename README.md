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
| `GET /api/categories`     | `?search= &status=active|paused &summary=true`      |
| `GET /api/categories/:slug` | Category, latest value, counts, last 30 entries   |
| `GET /api/results`        | The full query set (below)                          |
| `GET /api/results/:id`    | One entry with its category                         |
| `GET /api/history`        | As `/api/results`, plus archive coverage in `meta`  |
| `GET /api/statistics`     | `?category= &days=7..60`                            |

Query parameters for `/api/results` and `/api/history`:

| Param                  | Type                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `category`             | slug                                                          |
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
| `/`                    | Overview: summary tiles, today's board, recent entries, categories |
| `/results`             | Today's board plus the full day schedule; auto-refreshes          |
| `/categories`          | All categories, filterable by name                                |
| `/categories/[slug]`   | Current value, key numbers, two charts, the category's own archive |
| `/history`             | The full archive: filters, sorting, pagination                    |
| `/statistics`          | Five charts, scoped by category and time window                   |
| `/search`              | Search categories, dates and values                               |
| `/about`               | What the site is, what it is not, how the data is made            |

## Notes on the implementation

- **Responsive.** Mobile-first. The archive table becomes cards below `md`
  rather than a horizontal scroll; the filter panel collapses behind a
  disclosure below `lg`; navigation becomes a menu below `lg`. Both the table
  and the card list are server-rendered and toggled by CSS.
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

## Deployment

Any Node host: `npm run build && npm start`. Set `NEXT_PUBLIC_SITE_URL` to the
public origin so canonicals, Open Graph URLs and the sitemap are correct.
