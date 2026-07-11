export function getEffectivePrice(p) {
  const onSale = Boolean(p.is_on_sale) && p.discount_price != null
  return {
    price: onSale ? Number(p.discount_price) : Number(p.price),
    oldPrice: onSale ? Number(p.price) : undefined,
    discountPercent: onSale ? Math.round((1 - p.discount_price / p.price) * 100) : undefined,
  }
}

// Variants don't have their own is_on_sale flag (kept simple, see backend) — a discount_price
// lower than price is itself the "on sale" signal.
export function getVariantEffectivePrice(v) {
  const onSale = v.discount_price != null && Number(v.discount_price) < Number(v.price)
  return {
    price: onSale ? Number(v.discount_price) : Number(v.price),
    oldPrice: onSale ? Number(v.price) : undefined,
    discountPercent: onSale ? Math.round((1 - v.discount_price / v.price) * 100) : undefined,
  }
}
