// Brand isn't a category-attribute — it's a plain text field on every product — so the
// storefront filter is built by reading whatever brand values already exist among the products
// on the current page. Deduped case/whitespace-insensitively so "Dell" and "dell" (typed on
// different days, possibly by different admins) collapse into one filter option instead of
// showing as two, using whichever casing was seen first as the display label.
export function buildBrandOptions(products) {
  const byKey = new Map()
  for (const p of products) {
    const raw = p.brand?.trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!byKey.has(key)) byKey.set(key, raw)
  }
  return [...byKey.entries()].map(([key, label]) => ({ id: key, label }))
}

// selectedBrands holds the same lowercase keys buildBrandOptions hands out as `id`, so this
// matches a product regardless of which exact casing its own brand field happens to use.
export function matchesSelectedBrands(product, selectedBrands) {
  if (selectedBrands.size === 0) return true
  const key = product.brand?.trim().toLowerCase()
  return key ? selectedBrands.has(key) : false
}
