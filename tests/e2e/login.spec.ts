import { test, expect } from '@playwright/test';

test.describe('Login PrestaShop', () => {
  // TODO: implementar casos de login (válido, inválido, campos vacíos)
  test.skip('debería iniciar sesión con credenciales válidas', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/account');
  });
});