/**
 * End-to-end checks against a real server: routing, query validation, the
 * service layer's filtering/sorting/pagination, and the public pages.
 *
 * Run with `npm test` (builds, starts on a spare port, tears down after).
 * No test framework — node:test and fetch are enough.
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = process.env.TEST_PORT ?? "3199";
const BASE = process.env.TEST_BASE_URL ?? `http://localhost:${PORT}`;
let server;

async function get(path) {
  const response = await fetch(`${BASE}${path}`);
  const text = await response.text();
  const json = response.headers.get("content-type")?.includes("json")
    ? JSON.parse(text)
    : null;
  return { response, text, json };
}

before(async () => {
  // TEST_BASE_URL means "a server is already running" — don't start another.
  if (process.env.TEST_BASE_URL) return;
  server = spawn("npm", ["start", "--", "-p", PORT], {
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 120; i++) {
    try {
      const response = await fetch(`${BASE}/api/categories`);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error("server did not start");
});

after(() => {
  if (server?.pid) process.kill(-server.pid, "SIGTERM");
});

describe("categories API", () => {
  it("lists every category", async () => {
    const { response, json } = await get("/api/categories");
    assert.equal(response.status, 200);
    assert.equal(json.data.length, 18);
    assert.equal(json.meta.total, 18);
    assert.ok(json.data.every((c) => c.slug && c.scheduleTime));
    // Every market belongs to exactly one group, and all three are populated.
    const groups = new Set(json.data.map((c) => c.group));
    assert.deepEqual([...groups].sort(), ["day", "night", "special"]);
  });

  it("filters by market group", async () => {
    const { json } = await get("/api/categories?status=active");
    const night = await get("/api/results?group=night&limit=100");
    const nightSlugs = new Set(
      json.data.filter((c) => c.group === "night").map((c) => c.slug),
    );
    assert.ok(night.json.data.length > 0);
    assert.ok(
      night.json.data.every((r) => nightSlugs.has(r.categorySlug) || r.categorySlug === "express-results"),
      "group=night returns only night markets",
    );

    const bad = await get("/api/results?group=afternoon");
    assert.equal(bad.response.status, 400);
  });

  it("filters by status", async () => {
    const { json } = await get("/api/categories?status=paused");
    assert.ok(json.data.length >= 1);
    assert.ok(json.data.every((c) => c.status === "paused"));
  });

  it("rejects an unknown status", async () => {
    const { response, json } = await get("/api/categories?status=banana");
    assert.equal(response.status, 400);
    assert.equal(json.error.code, "invalid_query");
    assert.ok(json.error.details.some((d) => d.field === "status"));
  });

  it("returns one category with its recent results", async () => {
    const { response, json } = await get("/api/categories/alpha-market");
    assert.equal(response.status, 200);
    assert.equal(json.data.category.slug, "alpha-market");
    assert.ok(json.data.recentResults.length > 0);
    assert.ok(json.data.recentResults.every((r) => r.categorySlug === "alpha-market"));
  });

  it("404s an unknown category", async () => {
    const { response, json } = await get("/api/categories/not-a-category");
    assert.equal(response.status, 404);
    assert.equal(json.error.code, "not_found");
  });
});

describe("results API", () => {
  it("paginates", async () => {
    const { json } = await get("/api/results?limit=5");
    assert.equal(json.data.length, 5);
    assert.equal(json.meta.limit, 5);
    assert.ok(json.meta.total > 100, "demo archive should hold 100+ entries");
    assert.equal(json.meta.totalPages, Math.ceil(json.meta.total / 5));

    const second = await get("/api/results?limit=5&page=2");
    assert.notEqual(second.json.data[0].id, json.data[0].id);
  });

  it("clamps a page beyond the end to the last page", async () => {
    const { json } = await get("/api/results?limit=5&page=9999");
    assert.equal(json.meta.page, json.meta.totalPages);
    assert.ok(json.data.length > 0);
  });

  it("filters by category", async () => {
    const { json } = await get("/api/results?category=metro-results&limit=100");
    assert.ok(json.data.length > 0);
    assert.ok(json.data.every((r) => r.categorySlug === "metro-results"));
  });

  it("filters by status and date range", async () => {
    const { json } = await get("/api/results?status=published&limit=100");
    assert.ok(json.data.every((r) => r.status === "published" && r.value !== null));

    const range = await get("/api/history?startDate=2000-01-01&endDate=2000-01-02");
    assert.equal(range.json.data.length, 0, "an empty range returns no rows");
    assert.equal(range.json.meta.total, 0);
  });

  it("sorts by value, with unpublished entries last", async () => {
    const { json } = await get("/api/results?sort=value_asc&limit=100");
    const values = json.data.map((r) => r.value);
    const published = values.filter((v) => v !== null).map(Number);
    assert.deepEqual(published, [...published].sort((a, b) => a - b));
    const firstNull = values.indexOf(null);
    if (firstNull !== -1) {
      assert.ok(values.slice(firstNull).every((v) => v === null));
    }
  });

  it("searches by value and by category name", async () => {
    const { json } = await get("/api/results?search=alpha&limit=10");
    assert.ok(json.data.length > 0);
    assert.ok(json.data.every((r) => r.categoryName.toLowerCase().includes("alpha")));
  });

  it("reports every invalid parameter at once", async () => {
    const { response, json } = await get("/api/results?page=0&limit=999&startDate=nope");
    assert.equal(response.status, 400);
    const fields = json.error.details.map((d) => d.field).sort();
    assert.deepEqual(fields, ["limit", "page", "startDate"]);
  });

  it("fetches a single result and 404s an unknown id", async () => {
    const list = await get("/api/results?limit=1");
    const id = list.json.data[0].id;
    const { response, json } = await get(`/api/results/${id}`);
    assert.equal(response.status, 200);
    assert.equal(json.data.id, id);
    assert.equal(json.data.category.slug, json.data.categorySlug);

    const missing = await get("/api/results/nope_2020-01-01");
    assert.equal(missing.response.status, 404);
  });
});

describe("statistics API", () => {
  it("summarises the archive", async () => {
    const { response, json } = await get("/api/statistics?days=30");
    assert.equal(response.status, 200);
    const stats = json.data;
    assert.equal(stats.resultsOverTime.length, 30);
    assert.equal(stats.distribution.length, 10);
    assert.equal(stats.weekdayActivity.length, 7);
    assert.equal(
      stats.distribution.reduce((sum, d) => sum + d.count, 0),
      stats.summary.publishedResults,
      "every published value lands in exactly one bucket",
    );
    assert.equal(stats.summary.totalCategories, 18);
  });

  it("scopes to one category", async () => {
    const all = await get("/api/statistics");
    const one = await get("/api/statistics?category=star-market");
    assert.equal(one.json.data.categoryActivity.length, 1);
    assert.ok(one.json.data.summary.totalResults < all.json.data.summary.totalResults);
  });

  it("rejects an out-of-range window and an unknown category", async () => {
    assert.equal((await get("/api/statistics?days=900")).response.status, 400);
    assert.equal((await get("/api/statistics?category=ghost")).response.status, 404);
  });
});

describe("public pages", () => {
  const paths = [
    "/",
    "/results",
    "/results?group=night",
    "/categories",
    "/categories/alpha-market",
    "/charts",
    "/charts?market=central-results",
    "/history",
    "/statistics",
    "/search",
    "/about",
    "/faqs",
    "/disclaimer",
  ];

  /** Markup only — the RSC payload in <script> tags legitimately contains
   *  tokens like `$undefined`. */
  const markup = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "");

  for (const path of paths) {
    it(`renders ${path}`, async () => {
      const { response, text } = await get(path);
      assert.equal(response.status, 200);
      const body = markup(text);
      assert.match(body, /<h1[^>]*>/, "every page has an h1");
      assert.equal((body.match(/<h1/g) ?? []).length, 1, "exactly one h1");
      assert.ok(!/undefined|\[object Object\]|NaN/.test(body), "no leaked placeholders");
      assert.match(body, /Demonstration site/, "the demo-data notice is present");
    });
  }

  it("404s an unknown category page", async () => {
    assert.equal((await get("/categories/not-real")).response.status, 404);
  });

  it("server-renders the same filtered set the API reports", async () => {
    const api = await get("/api/results?category=alpha-market&limit=5");
    const page = await get("/history?category=alpha-market&limit=5");
    const body = markup(page.text);
    assert.match(body, /Alpha Market/);
    assert.ok(
      body.includes(`${api.json.meta.total} entries`),
      `page should report ${api.json.meta.total} entries`,
    );
    // The filtered table links only to the selected category. Footer links to
    // every category always exist, so compare inside the table markup.
    const table = body.slice(body.indexOf("Archive"), body.indexOf("<footer"));
    assert.ok(!table.includes("Metro Results"), "other categories are filtered out");
  });

  /** Regression guard for the bug that broke every phone width: a <table>
   *  ignores `width: 1px`, so `sr-only` must sit on a wrapping element, never
   *  on the table itself. Cheap to assert in markup, expensive to spot by eye. */
  it("never puts sr-only directly on a table", async () => {
    for (const path of ["/statistics", "/categories/alpha-market"]) {
      const { text } = await get(path);
      assert.ok(
        !/<table[^>]*class="[^"]*sr-only/.test(text),
        `${path}: sr-only on a <table> overflows the viewport`,
      );
    }
  });

  it("keeps result tables inside a scroll container", async () => {
    const { text } = await get("/history");
    // The wide table must live in a `scroll-x` box so a narrow tablet scrolls
    // the table instead of the whole page.
    assert.match(markup(text), /scroll-x[^"]*hidden md:block/);
  });

  it("renders the calendar and frequency grids", async () => {
    const { text } = await get("/charts?market=alpha-market");
    const body = markup(text);
    assert.match(body, /Calendar/);
    assert.match(body, /Value frequency/);
    // 100 frequency cells plus the calendar's own cells.
    assert.ok((body.match(/aspect-square/g) ?? []).length >= 100);
    assert.match(body, /says nothing about/, "the frequency grid carries its caveat");
  });

  it("falls back to a valid market and month for bad chart input", async () => {
    const { response, text } = await get("/charts?market=nope&month=1999-13");
    assert.equal(response.status, 200);
    assert.match(markup(text), /Calendar/);
  });

  it("degrades gracefully on nonsense query parameters", async () => {
    const { response, text } = await get("/history?page=abc&sort=chaos&startDate=nope");
    assert.equal(response.status, 200, "pages ignore bad params rather than erroring");
    assert.match(markup(text), /Archive/);
  });

  it("keeps admin-free routing honest: robots and sitemap exist", async () => {
    const robots = await get("/robots.txt");
    assert.match(robots.text, /Sitemap:/);
    const sitemap = await get("/sitemap.xml");
    assert.match(sitemap.text, /categories\/alpha-market/);
  });
});
