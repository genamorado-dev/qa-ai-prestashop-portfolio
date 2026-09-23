import { test, expect } from '@playwright/test';

test.describe('Checkout PrestaShop', () => {
  // TODO: implementar flujo de checkout (añadir al carrito, dirección, pago)
  test.skip('debería completar una compra', async ({ page }) => {
    await page.goto('/');
    await expect(page).toBeVisible();
  });
});