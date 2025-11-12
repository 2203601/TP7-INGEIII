import { test, expect } from '@playwright/test';

test.describe('☕ CoffeeHub - CRUD de cafés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ================================================================
  // 🟢 CREAR
  // ================================================================
  test('Debe crear un nuevo café exitosamente', async ({ page }) => {
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });

    await page.fill('#name', 'Café Test E2E');
    await page.fill('#origin', 'Colombia');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '25.99');
    await page.fill('#rating', '4.5');
    await page.fill('#roast', 'Medium');

    await page.click('button:has-text("✅ Agregar Café")');

    await expect(
      page.locator('.coffee-card').filter({ hasText: 'Café Test E2E' })
    ).toBeVisible({ timeout: 10000 });
  });

  // ================================================================
  // 🟡 EDITAR
  // ================================================================
  test('Debe editar un café existente', async ({ page }) => {
    // Crear uno para editar
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', 'Café Edición');
    await page.fill('#origin', 'Brasil');
    await page.fill('#type', 'Robusta');
    await page.fill('#price', '19.99');
    await page.fill('#rating', '3.8');
    await page.fill('#roast', 'Dark');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const firstCard = page.locator('.coffee-card').filter({ hasText: 'Café Edición' });
    await firstCard.locator('button:has-text("Editar")').click();

    // Esperar a que el formulario y el botón sean visibles
    await page.waitForSelector('button:has-text("💾 Guardar Cambios")', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500); // 🕐 Delay adicional para entornos lentos (Azure QA)

    await page.fill('#name', 'Café Editado Final');
    await page.click('button:has-text("💾 Guardar Cambios")', { timeout: 10000 });

    await expect(page.locator('.coffee-card').filter({ hasText: 'Café Editado Final' }))
      .toBeVisible({ timeout: 10000 });
  });

  // ================================================================
  // 🔴 ELIMINAR
  // ================================================================
  test('Debe eliminar un café', async ({ page }) => {
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', 'Café Eliminar');
    await page.fill('#origin', 'Perú');
    await page.fill('#type', 'Blend');
    await page.fill('#price', '22.50');
    await page.fill('#rating', '4.2');
    await page.fill('#roast', 'Light');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const targetCard = page.locator('.coffee-card').filter({ hasText: 'Café Eliminar' });
    await expect(targetCard).toHaveCount(1);

    page.once('dialog', dialog => dialog.accept());
    await targetCard.locator('button:has-text("Eliminar")').click();

    await expect(targetCard).toHaveCount(0);
  });

  // ================================================================
  // 🔵 CANCELAR
  // ================================================================
  test('Debe cancelar una edición sin guardar cambios', async ({ page }) => {
    // Crear uno propio
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', 'Café Cancelar');
    await page.fill('#origin', 'Chile');
    await page.fill('#type', 'Blend');
    await page.fill('#price', '20.00');
    await page.fill('#rating', '4.0');
    await page.fill('#roast', 'Medium');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    const card = page.locator('.coffee-card').filter({ hasText: 'Café Cancelar' });
    await card.locator('button:has-text("Editar")').click();

    // Esperar que aparezca el botón cancelar
    await page.waitForSelector('button:has-text("Cancelar")', { state: 'visible' });
    await page.waitForTimeout(500);

    await page.fill('#name', 'Café Cancelado');
    await page.click('button:has-text("Cancelar")');

    // Revalidar texto original
    await expect(card).toContainText('Café Cancelar', { timeout: 10000 });
  });
});
