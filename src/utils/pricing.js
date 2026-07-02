export function getEffectivePrice(p) {
  const onSale = Boolean(p.is_on_sale) && p.discount_price != null
  return {
    price: onSale ? Number(p.discount_price) : Number(p.price),
    oldPrice: onSale ? Number(p.price) : undefined,
    discountPercent: onSale ? Math.round((1 - p.discount_price / p.price) * 100) : undefined,
  }
}
