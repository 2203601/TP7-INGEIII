// e2e/tests/coffee-crud.spec.ts - ARREGLOS

import { test, expect } from '@playwright/test';

test.describe('CRUD de Cafés', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Debe crear un nuevo café exitosamente', async ({ page }) => {
    // Llenar formulario
    await page.fill('#name', 'Café Test E2E');
    await page.fill('#origin', 'Colombia');
    
    // ❌ ANTES (INCORRECTO): await page.selectOption('#type', 'Arábica');
    // ✅ AHORA (CORRECTO): Usar fill() porque es un input text
    await page.fill('#type', 'Arábica');
    
    await page.fill('#price', '25.99');
    await page.fill('#rating', '4.5');
    
    // ❌ ANTES: await page.selectOption('#roast', 'Medium');
    // ✅ AHORA:
    await page.fill('#roast', 'Medium');
    
    // Agregar café
    await page.click('button:has-text("✅ Agregar Café")');

    // Verificar que aparece en la lista
    await expect(page.locator('.coffee-card').filter({ hasText: 'Café Test E2E' }))
      .toBeVisible({ timeout: 10000 });
  });

  test('Debe editar un café existente', async ({ page }) => {
    // Primero crear uno para editar
    await page.fill('#name', 'Café Original');
    await page.fill('#origin', 'Brasil');
    await page.fill('#type', 'Robusta');
    await page.fill('#price', '20.00');
    await page.fill('#rating', '3.5');
    await page.fill('#roast', 'Dark');
    await page.click('button:has-text("✅ Agregar Café")');

    await page.waitForSelector('.coffee-card');

    // Editar
    await page.locator('.coffee-card').first().locator('button:has-text("✏️ Editar")').click();
    
    await page.fill('#name', 'Café Editado');
    await page.fill('#price', '22.50');
    await page.click('button:has-text("💾 Guardar Cambios")');

    // Verificar cambios
    await expect(page.locator('.coffee-card').filter({ hasText: 'Café Editado' }))
      .toBeVisible();
    await expect(page.locator('.coffee-card').filter({ hasText: '22.50' }))
      .toBeVisible();
  });

  test('Debe eliminar un café', async ({ page }) => {
    // Crear café para eliminar
    await page.fill('#name', 'Café a Eliminar');
    await page.fill('#origin', 'México');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '18.00');
    await page.fill('#rating', '4');
    await page.fill('#roast', 'Light');
    await page.click('button:has-text("✅ Agregar Café")');

    await page.waitForSelector('.coffee-card');

    // Eliminar
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.coffee-card').filter({ hasText: 'Café a Eliminar' })
      .locator('button:has-text("🗑️ Eliminar")').click();

    // Verificar que ya no está
    await expect(page.locator('.coffee-card').filter({ hasText: 'Café a Eliminar' }))
      .not.toBeVisible();
  });

  test('Debe cancelar la edición', async ({ page }) => {
    // Crear café primero
    await page.fill('#name', 'Café para Cancelar');
    await page.fill('#origin', 'Guatemala');
    await page.fill('#type', 'Arábica');
    await page.fill('#price', '21.00');
    await page.fill('#rating', '4.2');
    await page.fill('#roast', 'Medium');
    await page.click('button:has-text("✅ Agregar Café")');

    await page.waitForSelector('.coffee-card', { timeout: 10000 });

    // Abrir formulario de edición
    await page.locator('.coffee-card').first().locator('button:has-text("✏️ Editar")').click();

    // Cambiar datos pero cancelar
    await page.fill('#name', 'Nombre Temporal');
    await page.click('button:has-text("❌ Cancelar")');

    // Verificar que NO cambió
    await expect(page.locator('.coffee-card').filter({ hasText: 'Café para Cancelar' }))
      .toBeVisible();
    await expect(page.locator('.coffee-card').filter({ hasText: 'Nombre Temporal' }))
      .not.toBeVisible();
  });
});

