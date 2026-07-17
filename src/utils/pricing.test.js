import { describe, it, expect } from 'vitest'
import { getEffectivePrice, getVariantEffectivePrice } from './pricing'

describe('getEffectivePrice', () => {
  it('returns the plain price when not on sale', () => {
    const result = getEffectivePrice({ price: 1000, is_on_sale: false, discount_price: null })
    expect(result).toEqual({ price: 1000, oldPrice: undefined, discountPercent: undefined })
  })

  it('returns the discount price and computes the percent off when on sale', () => {
    const result = getEffectivePrice({ price: 1000, is_on_sale: true, discount_price: 750 })
    expect(result.price).toBe(750)
    expect(result.oldPrice).toBe(1000)
    expect(result.discountPercent).toBe(25)
  })

  it('ignores is_on_sale if discount_price is null', () => {
    const result = getEffectivePrice({ price: 1000, is_on_sale: true, discount_price: null })
    expect(result).toEqual({ price: 1000, oldPrice: undefined, discountPercent: undefined })
  })

  it('coerces string price fields to numbers (as MySQL DECIMAL columns arrive over JSON)', () => {
    const result = getEffectivePrice({ price: '1000.00', is_on_sale: true, discount_price: '750.00' })
    expect(result.price).toBe(750)
    expect(result.oldPrice).toBe(1000)
  })
})

describe('getVariantEffectivePrice', () => {
  it('returns the plain price when discount_price is null', () => {
    const result = getVariantEffectivePrice({ price: 1800, discount_price: null })
    expect(result).toEqual({ price: 1800, oldPrice: undefined, discountPercent: undefined })
  })

  it('treats a lower discount_price as on sale, with no separate is_on_sale flag', () => {
    const result = getVariantEffectivePrice({ price: 1800, discount_price: 1500 })
    expect(result.price).toBe(1500)
    expect(result.oldPrice).toBe(1800)
    expect(result.discountPercent).toBeCloseTo(17, 0)
  })

  it('is not on sale if discount_price is not actually lower than price', () => {
    const result = getVariantEffectivePrice({ price: 1800, discount_price: 1800 })
    expect(result).toEqual({ price: 1800, oldPrice: undefined, discountPercent: undefined })
  })

  it('is not on sale if discount_price is higher than price (bad data, should not inflate)', () => {
    const result = getVariantEffectivePrice({ price: 1800, discount_price: 2000 })
    expect(result.price).toBe(1800)
    expect(result.oldPrice).toBeUndefined()
  })
})
