/**
 * Admin panel checks against a real server and a real PostgreSQL database.
 *
 * Covers the operations the panel is built on: authentication, the
 * category/result CRUD services (through their JSON API, which calls exactly the
 * same functions the server actions do), the constraints that keep the archive
 * intact, and the public site picking up every change.
 *
 * Requires the database to be up: `npm run db:up && npm run db:migrate && npm run db:seed`.
 * Everything it creates is removed again in `after`, so `tests/api.test.mjs`
 * still sees the seeded 18 categories. `npm test` runs the files one at a time
 * for that reason.
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = process.env.TEST_ADMIN_PORT ?? "3198";
const BASE = process.env.TEST_ADMIN_BASE_URL ?? `http://localhost:${PORT}`;

/** Credentials come from the environment or `.env` — never from this file. */
function credentials() {
  const env = { ...process.env };
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    try {
      for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
        const match = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (match) env[match[1]] ??= match[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* no .env — rely on the environment */
    }
  }
  return { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD };
}

let server;
let cookie = "";

async function call(path, { method = "GET", body, auth = true, redirect = "follow" } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    redirect,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(auth && cookie ? { cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const json = response.headers.get("content-type")?.includes("json") ? JSON.parse(text) : null;
  return { response, text, json };
}

before(async () => {
  if (!process.env.TEST_ADMIN_BASE_URL) {
    server = spawn("npm", ["start", "--", "-p", PORT], { stdio: "ignore", detached: true });
    for (let i = 0; i < 120; i++) {
      try {
        if ((await fetch(`${BASE}/api/categories`)).ok) break;
      } catch {
        /* not up yet */
      }
      await sleep(500);
      if (i === 119) throw new Error("server did not start");
    }
  }

  const { email, password } = credentials();
  assert.ok(email && password, "ADMIN_EMAIL / ADMIN_PASSWORD must be set (see .env.example)");
  const { response, json } = await call("/api/admin/session", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  assert.equal(response.status, 200, "sign-in failed — has `npm run db:seed` been run?");
  assert.equal(json.data.email, email.toLowerCase());
  cookie = response.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  assert.match(cookie, /numera_admin_session=/);
});

/** Slug used by the create/update/delete flow. Removed again in `after`. */
const SLUG = "test-alpha-board";
let createdCategoryId = null;
const createdResultIds = new Set();

after(async () => {
  if (!cookie) return;
  for (const id of createdResultIds) {
    await call(`/api/admin/results/${id}`, { method: "DELETE" });
  }
  if (createdCategoryId) {
    const { json } = await call(`/api/admin/results?category=${SLUG}&limit=100`);
    for (const row of json?.data ?? []) {
      await call(`/api/admin/results/${row.id}`, { method: "DELETE" });
    }
    await call(`/api/admin/categories/${createdCategoryId}`, { method: "DELETE" });
  }
  if (server?.pid) process.kill(-server.pid, "SIGTERM");
});

const categoryPayload = (overrides = {}) => ({
  name: { en: "Test Alpha Board", hi: "", or: "" },
  slug: SLUG,
  description: {
    en: "A fictional market created by the automated test suite. It carries no real data.",
    hi: "",
    or: "",
  },
  scheduleTime: "10:05",
  group: "special",
  isActive: true,
  displayOrder: 900,
  updateFrequency: "Daily",
  accent: 3,
  ...overrides,
});

describe("admin authorization", () => {
  it("refuses every mutation without a session", async () => {
    const list = await call("/api/admin/categories", { auth: false });
    assert.equal(list.response.status, 401);
    assert.equal(list.json.error.code, "unauthorized");

    const create = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload({ slug: "should-never-exist" }),
      auth: false,
    });
    assert.equal(create.response.status, 401);

    const results = await call("/api/admin/results", {
      method: "POST",
      body: { categoryId: "x", value: "01", publishedDate: "2026-01-01", publishedTime: "10:00", status: "published" },
      auth: false,
    });
    assert.equal(results.response.status, 401);

    // …and the row really was not written.
    const check = await call("/api/admin/categories?search=should-never-exist");
    assert.equal(check.json.data.length, 0);
  });

  it("rejects a wrong password and accepts the right one", async () => {
    const { email } = credentials();
    const bad = await call("/api/admin/session", {
      method: "POST",
      body: { email, password: "definitely-not-the-password" },
      auth: false,
    });
    assert.equal(bad.response.status, 401);

    const unknown = await call("/api/admin/session", {
      method: "POST",
      body: { email: "nobody@example.com", password: "whatever" },
      auth: false,
    });
    assert.equal(unknown.response.status, 401);

    const me = await call("/api/admin/session");
    assert.equal(me.response.status, 200);
    assert.equal(me.json.data.email, email.toLowerCase());
  });

  it("sends a browser without a session to the sign-in page", async () => {
    const { response } = await call("/admin/categories", { auth: false, redirect: "manual" });
    assert.ok([302, 307, 308].includes(response.status), `expected a redirect, got ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/login/);
  });

  it("serves the admin pages to a signed-in administrator", async () => {
    for (const path of [
      "/admin/dashboard",
      "/admin/categories",
      "/admin/categories/new",
      "/admin/results",
      "/admin/results/new",
      "/admin/results/bulk",
      "/admin/settings",
    ]) {
      const { response, text } = await call(path);
      assert.equal(response.status, 200, `${path} should render`);
      const markup = text.replace(/<script[\s\S]*?<\/script>/g, "");
      assert.equal((markup.match(/<h1/g) ?? []).length, 1, `${path}: exactly one h1`);
      assert.ok(!/undefined|\[object Object\]|NaN/.test(markup), `${path}: no leaked placeholders`);
    }
  });
});

describe("category management", () => {
  it("creates a category", async () => {
    const { response, json } = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload(),
      auth: true,
    });
    assert.equal(response.status, 201);
    createdCategoryId = json.data.id;
    assert.equal(json.data.slug, SLUG);
    assert.equal(json.data.isActive, true);
    assert.equal(json.data.resultCount, 0);
    // Blank translations fall back to English rather than rendering empty.
    assert.equal(json.data.name.hi, "Test Alpha Board");
  });

  it("rejects a duplicate slug", async () => {
    const { response, json } = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload({ name: { en: "Different Name", hi: "", or: "" } }),
    });
    assert.equal(response.status, 409);
    assert.equal(json.error.code, "conflict");
    assert.ok(json.error.details.some((d) => d.field === "slug"));
  });

  it("rejects a duplicate name under a different slug", async () => {
    const { response } = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload({ slug: "test-alpha-board-two" }),
    });
    assert.equal(response.status, 409);
  });

  it("validates the input", async () => {
    const { response, json } = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload({
        slug: "Not A Slug",
        name: { en: "", hi: "", or: "" },
        scheduleTime: "25:99",
        displayOrder: "banana",
      }),
    });
    assert.equal(response.status, 400);
    const fields = json.error.details.map((d) => d.field).sort();
    assert.deepEqual(fields, ["displayOrder", "name.en", "scheduleTime", "slug"]);
  });

  it("updates a category", async () => {
    const { response, json } = await call(`/api/admin/categories/${createdCategoryId}`, {
      method: "PATCH",
      body: { name: { en: "Test Alpha Board", hi: "टेस्ट अल्फा बोर्ड", or: "" }, scheduleTime: "10:45" },
    });
    assert.equal(response.status, 200);
    assert.equal(json.data.scheduleTime, "10:45");
    assert.equal(json.data.name.hi, "टेस्ट अल्फा बोर्ड");

    const reread = await call(`/api/admin/categories/${createdCategoryId}`);
    assert.equal(reread.json.data.scheduleTime, "10:45");
  });

  it("404s an unknown category", async () => {
    assert.equal((await call("/api/admin/categories/nope")).response.status, 404);
    assert.equal(
      (await call("/api/admin/categories/nope", { method: "PATCH", body: { isActive: false } }))
        .response.status,
      404,
    );
  });

  it("filters, searches and paginates", async () => {
    const search = await call(`/api/admin/categories?search=${SLUG}`);
    assert.equal(search.json.data.length, 1);

    const inactive = await call("/api/admin/categories?status=inactive");
    assert.ok(inactive.json.data.every((c) => c.isActive === false));

    const paged = await call("/api/admin/categories?limit=5");
    assert.equal(paged.json.data.length, 5);
    assert.equal(paged.json.meta.limit, 5);
    assert.equal(paged.json.meta.totalPages, Math.ceil(paged.json.meta.total / 5));

    const beyond = await call("/api/admin/categories?limit=5&page=9999");
    assert.equal(beyond.json.meta.page, beyond.json.meta.totalPages);
  });

  it("deactivates and reactivates a category", async () => {
    const off = await call(`/api/admin/categories/${createdCategoryId}`, {
      method: "PATCH",
      body: { isActive: false },
    });
    assert.equal(off.response.status, 200);
    assert.equal(off.json.data.isActive, false);

    // The public API reports it as paused, and excludes it from `status=active`.
    const publicPaused = await call("/api/categories?status=paused", { auth: false });
    assert.ok(publicPaused.json.data.some((c) => c.slug === SLUG));
    const publicActive = await call("/api/categories?status=active", { auth: false });
    assert.ok(!publicActive.json.data.some((c) => c.slug === SLUG));

    const on = await call(`/api/admin/categories/${createdCategoryId}`, {
      method: "PATCH",
      body: { isActive: true },
    });
    assert.equal(on.json.data.isActive, true);
  });
});

describe("result management", () => {
  const DATE = "2026-03-04";

  it("creates a result against a real category", async () => {
    const { response, json } = await call("/api/admin/results", {
      method: "POST",
      body: {
        categoryId: createdCategoryId,
        value: "42",
        publishedDate: DATE,
        publishedTime: "10:46",
        status: "published",
      },
    });
    assert.equal(response.status, 201);
    createdResultIds.add(json.data.id);
    assert.equal(json.data.value, "42");
    assert.equal(json.data.publishedDate, DATE, "the calendar day must not shift timezone");
    assert.equal(json.data.categorySlug, SLUG);
  });

  it("rejects invalid results", async () => {
    const base = {
      categoryId: createdCategoryId,
      publishedDate: "2026-03-05",
      publishedTime: "10:46",
      status: "published",
    };

    const oneDigit = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: "7" },
    });
    assert.equal(oneDigit.response.status, 400);
    assert.ok(oneDigit.json.error.details.some((d) => d.field === "value"));

    const publishedWithoutValue = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: null },
    });
    assert.equal(publishedWithoutValue.response.status, 400);

    const pendingWithValue = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: "12", status: "pending" },
    });
    assert.equal(pendingWithValue.response.status, 400);

    const badDate = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: "12", publishedDate: "04-03-2026" },
    });
    assert.equal(badDate.response.status, 400);

    const unknownCategory = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: "12", categoryId: "not-a-category" },
    });
    assert.equal(unknownCategory.response.status, 400);

    // One entry per category per day.
    const duplicate = await call("/api/admin/results", {
      method: "POST",
      body: { ...base, value: "13", publishedDate: DATE },
    });
    assert.equal(duplicate.response.status, 409);
  });

  it("updates a result", async () => {
    const id = [...createdResultIds][0];
    const patched = await call(`/api/admin/results/${id}`, {
      method: "PATCH",
      body: { value: "77" },
    });
    assert.equal(patched.response.status, 200);
    assert.equal(patched.json.data.value, "77");

    // Clearing the value while still "published" is refused…
    const cleared = await call(`/api/admin/results/${id}`, {
      method: "PATCH",
      body: { value: null },
    });
    assert.equal(cleared.response.status, 400);

    // …but moving it to pending and clearing it together is fine.
    const pending = await call(`/api/admin/results/${id}`, {
      method: "PATCH",
      body: { value: null, status: "pending" },
    });
    assert.equal(pending.response.status, 200);
    assert.equal(pending.json.data.value, null);

    const restored = await call(`/api/admin/results/${id}`, {
      method: "PATCH",
      body: { value: "77", status: "published" },
    });
    assert.equal(restored.json.data.value, "77");
  });

  it("keeps the category relationship queryable both ways", async () => {
    const byId = await call(`/api/admin/results?category=${createdCategoryId}&limit=100`);
    const bySlug = await call(`/api/admin/results?category=${SLUG}&limit=100`);
    assert.ok(byId.json.data.length > 0);
    assert.equal(byId.json.meta.total, bySlug.json.meta.total);
    assert.ok(bySlug.json.data.every((row) => row.categorySlug === SLUG));

    const category = await call(`/api/admin/categories/${createdCategoryId}`);
    assert.equal(category.json.data.resultCount, byId.json.meta.total);
  });

  it("filters by status and date range, and sorts", async () => {
    const published = await call("/api/admin/results?status=published&limit=50");
    assert.ok(published.json.data.every((r) => r.status === "published" && r.value !== null));

    const empty = await call("/api/admin/results?startDate=1999-01-01&endDate=1999-01-02");
    assert.equal(empty.json.meta.total, 0);

    const ascending = await call("/api/admin/results?sort=value_asc&limit=50");
    const values = ascending.json.data.map((r) => r.value).filter((v) => v !== null).map(Number);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));

    const bad = await call("/api/admin/results?status=banana");
    assert.equal(bad.response.status, 400);
  });

  it("writes a bulk batch atomically", async () => {
    const before = (await call(`/api/admin/results?category=${SLUG}&limit=100`)).json.meta.total;

    const rows = [
      { categoryId: createdCategoryId, value: "11", publishedDate: "2026-03-06", publishedTime: "10:46", status: "published" },
      { categoryId: createdCategoryId, value: "12", publishedDate: "2026-03-07", publishedTime: "10:46", status: "published" },
      { categoryId: createdCategoryId, value: null, publishedDate: "2026-03-08", publishedTime: "10:46", status: "scheduled" },
    ];
    const created = await call("/api/admin/results/bulk", { method: "POST", body: { rows } });
    assert.equal(created.response.status, 201);
    assert.equal(created.json.data.created, 3);
    for (const row of created.json.data.rows) createdResultIds.add(row.id);

    // A batch containing one bad row writes nothing at all.
    const bad = await call("/api/admin/results/bulk", {
      method: "POST",
      body: {
        rows: [
          { categoryId: createdCategoryId, value: "21", publishedDate: "2026-03-09", publishedTime: "10:46", status: "published" },
          { categoryId: createdCategoryId, value: "22", publishedDate: "2026-03-06", publishedTime: "10:46", status: "published" },
        ],
      },
    });
    assert.equal(bad.response.status, 409);

    const after = (await call(`/api/admin/results?category=${SLUG}&limit=100`)).json.meta.total;
    assert.equal(after, before + 3, "the rejected batch must not have written its valid row");
  });
});

describe("database safety", () => {
  it("refuses to delete a category that still owns results", async () => {
    const { response, json } = await call(`/api/admin/categories/${createdCategoryId}`, {
      method: "DELETE",
    });
    assert.equal(response.status, 409);
    assert.equal(json.error.code, "blocked");

    const still = await call(`/api/admin/categories/${createdCategoryId}`);
    assert.equal(still.response.status, 200, "the category is untouched");
  });

  it("deletes results, then allows the category to go", async () => {
    const rows = (await call(`/api/admin/results?category=${SLUG}&limit=100`)).json.data;
    for (const row of rows) {
      const { response } = await call(`/api/admin/results/${row.id}`, { method: "DELETE" });
      assert.equal(response.status, 200);
      createdResultIds.delete(row.id);
    }
    assert.equal((await call(`/api/admin/results/${rows[0].id}`)).response.status, 404);

    const deleted = await call(`/api/admin/categories/${createdCategoryId}`, { method: "DELETE" });
    assert.equal(deleted.response.status, 200);
    assert.equal((await call(`/api/admin/categories/${createdCategoryId}`)).response.status, 404);
    createdCategoryId = null;
  });
});

describe("public site integration", () => {
  const SLUG2 = "test-beacon-board";
  let id = null;
  let resultId = null;

  after(async () => {
    if (resultId) await call(`/api/admin/results/${resultId}`, { method: "DELETE" });
    if (id) await call(`/api/admin/categories/${id}`, { method: "DELETE" });
  });

  it("shows a newly created category and result on the public site", async () => {
    const created = await call("/api/admin/categories", {
      method: "POST",
      body: categoryPayload({
        slug: SLUG2,
        name: { en: "Test Beacon Board", hi: "", or: "" },
        displayOrder: 901,
        scheduleTime: "09:05",
      }),
    });
    assert.equal(created.response.status, 201);
    id = created.json.data.id;

    // Public API and public page both see it immediately.
    const publicList = await call("/api/categories", { auth: false });
    assert.ok(publicList.json.data.some((c) => c.slug === SLUG2), "public API lists it");

    const publicPage = await call(`/categories/${SLUG2}`, { auth: false });
    assert.equal(publicPage.response.status, 200, "its public page resolves");
    assert.match(publicPage.text, /Test Beacon Board/);

    const listPage = await call("/categories", { auth: false });
    assert.match(listPage.text, /Test Beacon Board/);

    // Now a result under it.
    const result = await call("/api/admin/results", {
      method: "POST",
      body: {
        categoryId: id,
        value: "58",
        publishedDate: "2026-03-11",
        publishedTime: "09:06",
        status: "published",
      },
    });
    assert.equal(result.response.status, 201);
    resultId = result.json.data.id;

    const publicResults = await call(
      `/api/results?category=${SLUG2}&limit=10`,
      { auth: false },
    );
    assert.equal(publicResults.json.meta.total, 1);
    assert.equal(publicResults.json.data[0].value, "58");
    assert.equal(publicResults.json.data[0].date, "2026-03-11");

    const history = await call(`/history?category=${SLUG2}`, { auth: false });
    assert.match(history.text, /58/);

    // An edit is reflected too.
    await call(`/api/admin/results/${resultId}`, { method: "PATCH", body: { value: "59" } });
    const edited = await call(`/api/results?category=${SLUG2}&limit=10`, { auth: false });
    assert.equal(edited.json.data[0].value, "59");
  });
});
