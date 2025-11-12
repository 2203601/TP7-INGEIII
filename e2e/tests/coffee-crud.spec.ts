import { test, expect } from '@playwright/test';

test.describe('☕ CoffeeHub - CRUD de cafés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ================================================================
  // 🟢 CREAR
  // ================================================================
  test('Debe crear un nuevo café exitosamente', async ({ page }) => {
    // 👇 Abrir formulario
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });

    // Llenar campos
    await page.fill('#name', 'Café Test E2E');
    await page.fill('#origin', 'Colombia');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '25.99');
    await page.fill('#rating', '4.5');
    await page.fill('#roast', 'Medium');

    // Guardar
    await page.click('button:has-text("✅ Agregar Café")');

    // Verificar creación
    await expect(
      page.locator('.coffee-card').filter({ hasText: 'Café Test E2E' })
    ).toBeVisible({ timeout: 10000 });
  });

  // ================================================================
  // 🟡 EDITAR
  // ================================================================
  test('Debe editar un café existente', async ({ page }) => {
    // 👇 Crear uno para editar
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

    // ✏️ Editar el primer café
    const firstCard = page.locator('.coffee-card').first();
    await firstCard.locator('button:has-text("Editar")').click();

    await page.fill('#name', 'Café Editado');
    await page.click('button:has-text("💾 Guardar Cambios")');

    // Verificar actualización
    await expect(firstCard).toContainText('Café Editado');
  });

  // ================================================================
  // 🔴 ELIMINAR
  // ================================================================
  test('Debe eliminar un café', async ({ page }) => {
    // 👇 Crear uno para eliminar
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

    // Confirmar que existe antes de eliminar
    const targetCard = page.locator('.coffee-card').filter({ hasText: 'Café Eliminar' });
    await expect(targetCard).toHaveCount(1);

    // Eliminar
    page.once('dialog', dialog => dialog.accept()); // Aceptar confirmación
    await targetCard.locator('button:has-text("Eliminar")').click();

    // Verificar eliminación
    await expect(targetCard).toHaveCount(0);
  });

  // ================================================================
  // 🔵 CANCELAR
  // ================================================================
  test('Debe cancelar el agregado sin crear un nuevo café', async ({ page }) => {
    // 👇 Abrir formulario
    await page.click('button:has-text("➕ Agregar Café")');
    await page.waitForSelector('#name', { state: 'visible' });

    const initialCount = await page.locator('.coffee-card').count();

    await page.fill('#name', 'Café Cancelado');
    await page.click('button:has-text("Cancelar")');

    const finalCount = await page.locator('.coffee-card').count();
    expect(finalCount).toBe(initialCount);
  });
});
