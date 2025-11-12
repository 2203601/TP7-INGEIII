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
    await page.fill('#name', 'Café Editar');
    await page.fill('#origin', 'Brasil');
    await page.fill('#type', 'Robusta');
    await page.fill('#price', '19.99');
    await page.fill('#rating', '3.8');
    await page.fill('#roast', 'Dark');
    await page.click('button:has-text("✅ Agregar Café")');
    await page.waitForSelector('.coffee-card', { timeout: 5000 });

    // Editar
    const firstCard = page.locator('.coffee-card').first();
    await firstCard.locator('button:has-text("Editar")').click();

    // Esperar que el botón de guardar cambios sea visible
    await page.waitForSelector('button:has-text("💾 Guardar Cambios")', { state: 'visible' });

    await page.fill('#name', 'Café Editado');
    await page.click('button:has-text("💾 Guardar Cambios")', { timeout: 10000 });

    await expect(firstCard).toContainText('Café Editado', { timeout: 10000 });
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

    // Confirmar diálogo
    page.once('dialog', dialog => dialog.accept());
    await targetCard.locator('button:has-text("Eliminar")').click();

    await expect(targetCard).toHaveCount(0);
  });

  // ================================================================
  // 🔵 CANCELAR
  // ================================================================
  test('Debe cancelar una edición sin guardar cambios', async ({ page }) => {
    // Crear un café
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

    // Entrar en modo edición
    const firstCard = page.locator('.coffee-card').first();
    await firstCard.locator('button:has-text("Editar")').click();

    // Esperar que el botón "Cancelar" se muestre
    await page.waitForSelector('button:has-text("Cancelar")', { state: 'visible' });

    // Cambiar valor y cancelar
    await page.fill('#name', 'Café Cancelado');
    await page.click('button:has-text("Cancelar")');

    // Confirmar que sigue el nombre original
    await expect(firstCard).toContainText('Café Cancelar');
  });
});
