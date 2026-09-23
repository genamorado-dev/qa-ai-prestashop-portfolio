// TODO: implementar pruebas visuales del catálogo (Playwright + toHaveScreenshot)
import { test, expect } from '@playwright/test';

test.describe('Visual - Inventario', () => {
  test.skip('la página de inventario debería coincidir con el snapshot de referencia', async ({ page }) => {
    await page.goto('/catalog');
  });
});