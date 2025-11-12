import { test, expect } from '@playwright/test';

test.describe('CRUD de Cafés', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CoffeeHub');
  });

  test('Debe crear un nuevo café exitosamente', async ({ page }) => {
    // Abrir formulario
    await page.click('button:has-text("➕ Agregar Café")');
    await expect(page.locator('#add-form')).toBeVisible();

    // Llenar formulario
    await page.fill('#name', 'Café Test E2E');
    await page.fill('#origin', 'Colombia');
    await page.selectOption('#type', 'Arábica');
    await page.fill('#price', '25.99');
    await page.fill('#rating', '4.5');
    await page.selectOption('#roast', 'Medium');
    await page.fill('#description', 'Café de prueba automatizada');

    // Enviar formulario
    await page.click('button:has-text("✅ Agregar Café")');

    // Verificar alerta de éxito
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('agregado exitosamente');
      dialog.accept();
    });

    // Verificar que aparece en la lista
    await expect(page.locator('.coffee-card').filter({ hasText: 'Café Test E2E' }))
      .toBeVisible();
  });

  test('Debe editar un café existente', async ({ page }) => {
    // Esperar a que carguen los cafés
    await page.waitForSelector('.coffee-card', { timeout: 10000 });

    // Buscar el primer café y hacer clic en "Editar"
    const firstCard = page.locator('.coffee-card').first();
    const originalName = await firstCard.locator('h3').textContent();
    
    await firstCard.locator('button:has-text("✏️ Editar")').click();

    // Verificar que el formulario cambió a modo edición
    await expect(page.locator('#form-title')).toContainText('Editar Café');

    // Modificar el nombre
    await page.fill('#name', `${originalName} - EDITADO`);
    
    // Guardar cambios
    await page.click('button:has-text("💾 Guardar Cambios")');

    // Verificar alerta
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('actualizado exitosamente');
      dialog.accept();
    });

    // Verificar que el cambio se reflejó
    await expect(page.locator('.coffee-card').filter({ hasText: 'EDITADO' }))
      .toBeVisible();
  });

  test('Debe eliminar un café', async ({ page }) => {
    // Esperar a que carguen los cafés
    await page.waitForSelector('.coffee-card');

    // Contar cafés antes de eliminar
    const initialCount = await page.locator('.coffee-card').count();

    // Eliminar el primer café
    const firstCard = page.locator('.coffee-card').first();
    const coffeeName = await firstCard.locator('h3').textContent();

    // Manejar el confirm de eliminación
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Eliminar');
      dialog.accept();
    });

    await firstCard.locator('button:has-text("🗑️ Eliminar")').click();

    // Manejar alerta de éxito
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('eliminado exitosamente');
      dialog.accept();
    });

    // Verificar que se redujo el contador
    await page.waitForTimeout(500);
    const finalCount = await page.locator('.coffee-card').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('Debe cancelar la edición', async ({ page }) => {
    await page.waitForSelector('.coffee-card');

    // Abrir formulario de edición
    await page.locator('.coffee-card').first().locator('button:has-text("✏️ Editar")').click();
    await expect(page.locator('#form-title')).toContainText('Editar Café');

    // Cancelar
    await page.click('button:has-text("❌ Cancelar")');

    // Verificar que volvió a estado inicial
    await expect(page.locator('#add-form')).not.toBeVisible();
  });
});
