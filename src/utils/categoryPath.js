// /laptops is a standalone legacy route (kept for existing external links/bookmarks) that
// happens to show the same content as /category/laptops — every other category routes normally.
export function categorySlugToPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}
