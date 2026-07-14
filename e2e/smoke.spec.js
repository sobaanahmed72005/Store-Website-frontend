import { test, expect } from '@playwright/test'

// A minimal smoke test for the store's revenue-critical path: browse -> product -> cart -> a
// guest hitting Checkout is gated to sign-in first. Deliberately stops there rather than logging
// in and submitting a real order (that would create live data against whatever backend this runs
// against) — the goal is catching a broken build, not full checkout coverage.
test('storefront golden path: browse a product, add to cart, guest checkout gate', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)

  await page.goto('/products')
  const productLink = page.locator('a[href^="/product/"]').first()
  await expect(productLink).toBeVisible()
  const productHref = await productLink.getAttribute('href')

  await productLink.click()
  await expect(page).toHaveURL(productHref)

  const addToCartButton = page.getByRole('button', { name: 'Add To Cart' })
  await expect(addToCartButton).toBeVisible()
  await addToCartButton.click()

  await page.goto('/cart')
  await expect(page.getByText('Your shopping cart is empty.')).not.toBeVisible()

  // The cart page renders this link twice (two responsive layout variants, one hidden at this
  // viewport) — checking the href directly is more robust than clicking whichever isn't visible.
  const checkoutHref = await page.getByRole('link', { name: 'Checkout' }).first().getAttribute('href')
  expect(checkoutHref).toBe('/signin')
})

test('homepage renders without a render-time crash', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto('/')
  await expect(page.locator('body')).not.toContainText('Something went wrong')
  expect(pageErrors).toEqual([])
})
