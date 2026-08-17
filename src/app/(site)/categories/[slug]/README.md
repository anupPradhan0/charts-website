No `loading.tsx` above or inside this route — deliberately.

A loading boundary flushes the response shell immediately, which sends HTTP 200
before the page can call `notFound()`. That turns every unknown category URL
into a soft 404 that search engines will happily index.

The rule covers parent segments too: a `loading.tsx` sitting directly in
`app/categories/` would wrap this route in the same Suspense boundary. That is
why the listing page and its skeleton live in the `(list)` route group — the
group keeps the URL at `/categories` while scoping the boundary to the listing
alone.

The category set moved to PostgreSQL, so the router can no longer 404 an unknown
slug from a fixed `generateStaticParams` list. `notFound()` is called from
`generateMetadata`, which resolves before any of the page body renders, so the
status code is still the server's to set.

The "404s an unknown category page" test in `tests/api.test.mjs` guards this.
