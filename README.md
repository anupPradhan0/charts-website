# Numera — Results & Statistics Portal

A results and statistics portal: a live board of today's published values, a
filterable archive going back 60 days, descriptive statistics over that archive,
and an administration panel that manages all of it.

PostgreSQL is the single source of truth. The public site and the admin panel
read and write the same rows through Prisma — an administrator publishes a
result once and the public pages show it on the next request.

**This is a demonstration build.** Every category, schedule and value is
fictional seed data. There is no betting, wagering, payment or prediction
functionality, and the statistics pages describe past data only.

---

## Quick start

```bash
npm install
cp .env.example .env           # DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:up                  # PostgreSQL in Docker
npm run db:migrate             # apply migrations
npm run db:seed                # 18 markets, ~1000 results, the first admin
npm run dev                    # http://localhost:3000 — /admin to sign in
```

`.env` holds the credentials. Nothing is hardcoded in source: the first
administrator is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` at seed time, and
`DATABASE_URL` is read on the server only — never exposed to the browser.

To use managed Postgres (Neon, Supabase, …) instead of Docker, point
`DATABASE_URL` at the **pooled** endpoint and set `DIRECT_URL` to the unpooled
one — `prisma migrate` runs DDL, which a connection pooler will not do. Then
`npm run db:deploy && npm run db:seed`. With `DIRECT_URL` unset everything goes
through `DATABASE_URL`, which is what the local Docker database wants.

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Development server                                             |
| `npm run build`     | `prisma generate` + production build                           |
| `npm start`         | Serve the production build                                     |
| `npm run lint`      | ESLint                                                         |
| `npm run typecheck` | `tsc --noEmit`                                                 |
| `npm test`          | Starts the built app and runs the end-to-end suite. Run `npm run build` first, and have the database up. |
| `npm run db:up`     | Start PostgreSQL (Docker Compose), waiting for health          |
| `npm run db:down`   | Stop it                                                        |
| `npm run db:migrate`| `prisma migrate dev`                                           |
| `npm run db:deploy` | `prisma migrate deploy` (production)                           |
| `npm run db:generate`| `prisma generate`                                             |
| `npm run db:seed`   | Seed markets, results and the first administrator              |
| `npm run db:studio` | Prisma Studio                                                  |
| `npm run db:reset`  | Drop, re-migrate and re-seed                                   |

To test against a server you already have running:

```bash
TEST_BASE_URL=http://localhost:3000 npm test
```

The two test files run one at a time (`--test-concurrency=1`): the admin suite
creates and removes fixtures, and the public suite counts the seeded markets.

## Stack

| Concern    | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19        |
| Language   | TypeScript, strict                       |
| Database   | PostgreSQL 17 (Docker Compose locally)   |
| ORM        | Prisma 7 with the `pg` driver adapter    |
| Auth       | Session cookie + `node:crypto` scrypt — no dependency |
| Styling    | Tailwind CSS 4, design tokens in `globals.css` |
| Icons      | lucide-react                             |
| Charts     | Recharts                                 |
| Validation | Zod                                      |
| Forms      | React Hook Form (filters and admin forms) |
| Tests      | `node:test` + `fetch`, no framework      |

## Architecture

```
                         PostgreSQL
                              │
                            Prisma
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
  Read model            Admin services (src/lib/admin)
 (src/lib/data)          requireAdmin → validate → write
        │                     │                     │
 Public services       Server actions        Admin JSON API
 (src/lib/services)    (app/admin)           (api/admin/*)
    │        │
 Pages    Public JSON API
```

The **service layer is the only way to reach data**. Public pages and the public
API both read through `src/lib/services`, which reads through the read model in
`src/lib/data/snapshot.ts`. Admin reads and writes go through `src/lib/admin`,
and the server actions and the admin JSON API are two thin faces on those same
functions — no rule is implemented twice.

Authorization lives *inside* the admin services: every one of them begins with
`requireAdmin()`. A new route or action cannot forget it, and hiding a button
has never been the boundary.

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
    db.ts                 the Prisma client (server only)
    data/snapshot.ts      the read model: database rows → domain types
    services/             public queries: results, categories, statistics
    admin/                auth, Zod schemas, category/result/overview services
    api/                  HTTP envelope, error shape, query validation
    utils/                formatting, calendar-day helpers
  generated/prisma/       generated Prisma client (git-ignored)
  proxy.ts                redirects a browser with no session to /admin/login
  types/                  shared domain types
prisma/
  schema.prisma           the schema
  migrations/             SQL migrations
  seed.ts seed-data.ts    development seed
tests/                    end-to-end public + admin suites
docker-compose.yml        local PostgreSQL
```

The app routes are split into two groups under one document shell:
`app/(site)/` carries the public header, demo banner and footer;
`app/admin/(dashboard)/` carries the admin sidebar and topbar. Neither inherits
the other's navigation.

## Data model

```
Admin ──< Session          Category ──< Result
```

| `Category`        | Column                                            |
| ----------------- | ------------------------------------------------- |
| `id`, `slug`      | cuid; `slug` is unique                            |
| `name`            | `jsonb` `{ en, hi, or }`                          |
| `description`     | `jsonb` `{ en, hi, or }`                          |
| `scheduleTime`    | `varchar(5)`, 24h `HH:MM` daily slot              |
| `group`           | enum `day` \| `night` \| `special`                |
| `isActive`        | boolean — the public site reads it as `active` / `paused` |
| `displayOrder`    | integer, ascending                                |
| `updateFrequency` | `Daily` \| `Weekdays` \| `Paused`                 |
| `accent`          | 1–6, maps to a chart colour token                 |
| `createdAt`, `updatedAt` | timestamps                                 |

| `Result`          | Column                                            |
| ----------------- | ------------------------------------------------- |
| `id`              | cuid                                              |
| `categoryId`      | FK → `Category`, `onDelete: Restrict`             |
| `value`           | `varchar(2)`, `"00"`–`"99"`, `null` until published |
| `publishedDate`   | `date`                                            |
| `publishedTime`   | `varchar(5)`, 24h `HH:MM`                         |
| `status`          | enum `published` \| `pending` \| `scheduled`      |
| `createdAt`, `updatedAt` | timestamps                                 |

Constraints and indexes: `Category.slug` unique; `Result(categoryId,
publishedDate)` unique — one entry per market per day; indexes on
`publishedDate`, `status`, `(categoryId, publishedDate)`, `Category.isActive`
and `(group, displayOrder)`.

**Deletion is restricted, not cascading.** A category that still owns results
cannot be deleted — the archive would go with it. The admin panel explains this
and offers deactivation instead, which keeps the history readable while nothing
new is published.

**Localized text is stored once.** A market's name and description live in one
row as `{ en, hi, or }` and are resolved per reader. A blank translation falls
back to English rather than rendering empty.

**Statuses.** `scheduled` — the slot is still in the future. `pending` — the
slot has passed but nothing is published. `published` — a value and a timestamp
exist. `publishedAt` is derived from `publishedDate` + `publishedTime`, so it
cannot drift from them.

**Where the seed data comes from.** `prisma/seed.ts` generates 60 days of
history from a PRNG keyed on `(category, date)`, so re-seeding the same day
reproduces the same archive. It is idempotent — categories are upserted by slug
and results skip duplicates — so it never destroys work done in the panel.

**Reads.** `src/lib/data/snapshot.ts` loads categories and results once per
request (memoized with React `cache()`) and maps them onto the domain types the
services and UI already speak. Filtering, sorting, search and the statistics
maths then run over that array. Admin result lists do the opposite: they filter,
sort and paginate in SQL, because that table grows by one row per market per
day. Nothing is cached between requests, so an admin write is visible to the
public site immediately.

That last sentence is a deliberate trade, and it costs latency when the database
is far away. Against local Docker a page renders in 25–55 ms; against a database
in another region, ~300 ms, because every request pulls the whole archive across
the wire. Two cross-request caches were tried and both served data that no
longer existed — a module-level cache is per bundle graph, and Next's data cache
keeps on-disk entries that outlive the process which invalidated their tag. If
this becomes a problem, fetch less rather than cache more: push the filters into
SQL the way `src/lib/admin/*` already does, or host the app in the database's
region.

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

### Admin API

Same envelope, `Cache-Control: no-store`, and **every endpoint requires a
session** — an unauthenticated call gets `401`, never a partial answer.

| Endpoint                          | Notes                                        |
| --------------------------------- | -------------------------------------------- |
| `POST /api/admin/session`         | `{ email, password }` → sets the session cookie |
| `GET /api/admin/session`          | The signed-in administrator                   |
| `DELETE /api/admin/session`       | Sign out                                      |
| `GET /api/admin/categories`       | `?search= &status=active|inactive &group= &sort= &page= &limit=` |
| `POST /api/admin/categories`      | Create                                        |
| `GET/PATCH/DELETE /api/admin/categories/:id` | Read, update, delete (refused while results exist) |
| `GET /api/admin/results`          | `?search= &category= &status= &date= &startDate= &endDate= &sort= &page= &limit=` |
| `POST /api/admin/results`         | Create                                        |
| `GET/PATCH/DELETE /api/admin/results/:id` | Read, update, delete                  |
| `POST /api/admin/results/bulk`    | `{ rows: [...] }` — one transaction, all or nothing |

Failures carry a code: `400 validation`, `401 unauthorized`, `404 not_found`,
`409 conflict` (duplicate slug, duplicate name, an entry that already exists for
that market and day) and `409 blocked` (deletion refused). `message` and every
`details[].message` are translation keys, so the same failure reads in English,
Hindi or Odia depending on who is looking at it.

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

### Admin

| Route                    | What it does                                                   |
| ------------------------ | -------------------------------------------------------------- |
| `/admin/login`           | Sign-in (the only page in `/admin` reachable without a session) |
| `/admin/dashboard`       | Total / active categories, total results, published today, 14-day activity, recent results, recently created categories, latest updates |
| `/admin/categories`      | Search, filter, sort, paginate; activate / deactivate; delete when safe |
| `/admin/categories/new`  | Create — the slug follows the name until you edit it            |
| `/admin/categories/[id]` | Edit, plus that market's most recent results                    |
| `/admin/results`         | Search, filter by category / status / date range, sort, paginate |
| `/admin/results/new`     | Create one entry; the category list comes from the database     |
| `/admin/results/[id]`    | Edit or delete one entry                                        |
| `/admin/results/bulk`    | Several entries in one transaction                              |
| `/admin/settings`        | Account, database counts, localisation, session                 |

Every figure on the dashboard is counted in PostgreSQL. An empty database shows
zeros, never a placeholder statistic.

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
  clock, the filter panel, the auto-refresh control, the charts and the admin
  forms. Public API responses carry a short `s-maxage` so repeat traffic skips
  the render path; admin responses are `no-store`.
- **Admin security.** Sessions are a 32-byte random token in an httpOnly,
  SameSite=Lax cookie; only its SHA-256 hash is stored, so a database dump does
  not hand over live sessions. Passwords are scrypt-hashed with a per-password
  salt and compared in constant time. `proxy.ts` only redirects a cookie-less
  browser to the sign-in page — it never validates anything, because it cannot
  reach the database; `requireAdmin()` inside each service is the boundary.
- **Admin UI states.** Every screen has a loading path, an empty state that
  tells you what to do next, an error banner, inline field errors addressed to
  the field that caused them, a success notice carried through the redirect in
  the URL, a `<dialog>` confirmation before any delete, and a warning before
  leaving a form with unsaved changes.
- **Admin i18n.** The panel uses the same dictionary system as the public site.
  No English string is hardcoded in an admin component — including validation
  messages, which travel from the server as keys and are resolved by the form.

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

## Fixed: the soft 404 on unknown categories

`/categories/does-not-exist` used to render the not-found page with **HTTP 200**.
The cause was streaming: once a Suspense fallback renders, the headers are gone
and `notFound()` can no longer set a status. Two things were needed, and both
are guarded by `tests/api.test.mjs`:

- The listing page and its skeleton moved into the `(list)` route group, so
  `app/categories/loading.tsx` no longer wraps `[slug]` in a boundary.
- `notFound()` is called from `generateMetadata`, which resolves before any of
  the page body renders.

`src/app/categories/[slug]/README.md` keeps the note next to the code.

## Deployment

Any Node host with a PostgreSQL database:

```bash
DATABASE_URL=... npm run db:deploy    # apply migrations
DATABASE_URL=... npm run build
DATABASE_URL=... npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the public origin so canonicals, Open Graph URLs
and the sitemap are correct. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and run
`npm run db:seed` once to create the first administrator — or insert the row
yourself; nothing in the source knows a password. `docker-compose.yml` is for
local development, not production.
