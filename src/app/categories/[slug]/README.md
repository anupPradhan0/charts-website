No `loading.tsx` in this route — deliberately.

A loading boundary flushes the response shell immediately, which sends HTTP 200
before the page can call `notFound()`. That turns every unknown category URL
into a soft 404 that search engines will happily index.

This page has no external I/O, so it renders fast without a skeleton, and the
charts on it carry their own lazy-loading placeholders. The
"404s an unknown category page" test in `tests/api.test.mjs` guards this.
