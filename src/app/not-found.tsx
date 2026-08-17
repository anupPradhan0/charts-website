import SiteLayout from "./(site)/layout";
import SiteNotFound, { generateMetadata } from "./(site)/not-found";

/**
 * A URL that matches no route at all renders here, outside the `(site)` group
 * and therefore outside its header and footer. Composing the two components
 * directly gives an unmatched URL the same page a `notFound()` inside the site
 * produces, without a second copy of either.
 */
export { generateMetadata };

export default async function NotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <SiteNotFound />
    </SiteLayout>
  );
}
