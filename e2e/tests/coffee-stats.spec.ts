import { test, expect } from '@playwright/test';

test.describe('Estadísticas de Cafés', () => {
  
  test('Debe mostrar estadísticas correctas', async ({ page }) => {
    await page.goto('/');

    // Esperar a que carguen las estadísticas
    await page.waitForSelector('.stat-card', { timeout: 10000 });

    // Verificar que existen las tres tarjetas de estadísticas
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(3);

    // Verificar títulos
    await expect(page.locator('.stat-card').filter({ hasText: 'Total Cafés' }))
      .toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Precio Promedio' }))
      .toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Origen Popular' }))
      .toBeVisible();

    // Verificar que los valores son números/texto válidos
    const totalText = await page.locator('#total-coffees').textContent();
    expect(parseInt(totalText || '0')).toBeGreaterThanOrEqual(0);

    const priceText = await page.locator('#avg-price').textContent();
    expect(priceText).toMatch(/\$\d+\.\d{2}/);
  });

  test('Debe actualizar estadísticas al agregar café', async ({ page }) => {
    await page.goto('/');
    
    // Obtener total inicial
    const initialTotal = await page.locator('#total-coffees').textContent();

    // Agregar nuevo café
    await page.click('button:has-text("➕ Agregar Café")');
    await page.fill('#name', 'Café para Stats');
    await page.fill('#origin', 'Brasil');
    await page.selectOption('#type', 'Arábica');
    await page.fill('#price', '30.00');
    await page.fill('#rating', '5');
    await page.click('button:has-text("✅ Agregar Café")');

    page.once('dialog', dialog => dialog.accept());

    // Esperar actualización
    await page.waitForTimeout(1000);

    // Verificar que el total aumentó
    const newTotal = await page.locator('#total-coffees').textContent();
    expect(parseInt(newTotal || '0')).toBe(parseInt(initialTotal || '0') + 1);
  });
});