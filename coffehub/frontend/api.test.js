/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import * as appModule from './app.js';

// -----------------------------
// 🌐 DOM simulado
// -----------------------------
beforeEach(() => {
  document.body.innerHTML = `
    <form id="coffee-form">
      <input id="name" />
      <input id="origin" />
      <input id="type" />        <!-- agregado -->
      <input id="price" />
      <input id="rating" />
      <input id="roast" />       <!-- agregado -->
      <textarea id="description"></textarea>
      <button id="submit-btn"></button>
      <button id="cancel-btn"></button>
      <h2 id="form-title"></h2>
    </form>
    <div id="coffee-grid"></div>
    <span id="total-coffees"></span>
    <span id="avg-price"></span>
    <span id="popular-origin"></span>
  `;
});

// -----------------------------
// 🔹 Tests
// -----------------------------
describe('CoffeeHub Frontend', () => {

  describe('toggleForm()', () => {
    test('debe mostrar formulario cuando está oculto', () => {
      const form = document.getElementById('coffee-form');
      form.style.display = 'none';
      appModule.toggleForm();
      expect(form.style.display).toBe('block');
    });

    test('debe ocultar formulario cuando está visible', () => {
      const form = document.getElementById('coffee-form');
      form.style.display = 'block';
      appModule.toggleForm();
      expect(form.style.display).toBe('none');
    });

    test('debe cancelar edición al cerrar formulario', () => {
      const form = document.getElementById('coffee-form');
      form.style.display = 'block';
      appModule.setEditingCoffeeId('123');
      appModule.toggleForm();
      expect(appModule.getEditingCoffeeId()).toBeNull();
    });
  });

  describe('cancelEdit()', () => {
    test('debe resetear formulario correctamente', () => {
      const name = document.getElementById('name');
      name.value = 'Café Test';
      document.getElementById('form-title').textContent = 'Editar Café';
      document.getElementById('submit-btn').innerHTML = '💾 Guardar Cambios';
      document.getElementById('cancel-btn').style.display = 'inline-block';

      appModule.cancelEdit();

      expect(name.value).toBe('');
      expect(document.getElementById('form-title').textContent).toBe('Agregar Nuevo Café');
      expect(document.getElementById('submit-btn').innerHTML).toBe('Agregar Café');
      expect(document.getElementById('cancel-btn').style.display).toBe('none');
      expect(appModule.getEditingCoffeeId()).toBeNull();
    });
  });

  describe('editCoffee()', () => {
    const coffee = {
      id: '1',
      name: 'Café Test',
      origin: 'Colombia',
      type: 'Arábica',
      price: '12',
      rating: '5',
      roast: 'Medium',
      description: 'Delicioso'
    };

    const coffeeWithoutDesc = { ...coffee, description: '' };

    test('debe llenar formulario con datos del café', () => {
      appModule.editCoffee(coffee);
      expect(document.getElementById('name').value).toBe(coffee.name);
      expect(document.getElementById('origin').value).toBe(coffee.origin);
      expect(document.getElementById('price').value).toBe(coffee.price);
      expect(document.getElementById('rating').value).toBe(coffee.rating);
      expect(document.getElementById('description').value).toBe(coffee.description);
    });

    test('debe cambiar a modo edición', () => {
      appModule.editCoffee(coffee);
      expect(document.getElementById('form-title').textContent).toBe('Editar Café');
      expect(document.getElementById('submit-btn').innerHTML).toBe('💾 Guardar Cambios');
      expect(document.getElementById('cancel-btn').style.display).toBe('inline-block');
      expect(document.getElementById('coffee-form').style.display).toBe('block');
    });

    test('debe manejar descripción vacía', () => {
      appModule.editCoffee(coffeeWithoutDesc);
      expect(document.getElementById('description').value).toBe('');
    });
  });

  describe('updateStats()', () => {
    test('debe actualizar estadísticas correctamente', () => {
      const stats = { total: 2, avgPrice: 14.25, popularOrigin: 'Colombia' };
      appModule.updateStats(stats);

      expect(document.getElementById('total-coffees').textContent).toBe('2');
      expect(document.getElementById('avg-price').textContent).toBe('$14.25');
      expect(document.getElementById('popular-origin').textContent).toBe('Colombia');
    });

    test('debe manejar valores por defecto', () => {
      appModule.updateStats();

      expect(document.getElementById('total-coffees').textContent).toBe('0');
      expect(document.getElementById('avg-price').textContent).toBe('$0');
      expect(document.getElementById('popular-origin').textContent).toBe('N/A');
    });
  });

  describe('renderCoffees()', () => {
    test('debe renderizar cafés en el grid', () => {
      const mockCoffees = [
        { name: 'Café Colombiano' },
        { name: 'Café Brasileño' }
      ];
      appModule.renderCoffees(mockCoffees);
      const grid = document.getElementById('coffee-grid');
      expect(grid.children.length).toBe(mockCoffees.length);
      expect(grid.textContent).toContain('Café Colombiano');
      expect(grid.textContent).toContain('Café Brasileño');
    });

    test('debe mostrar mensaje cuando no hay cafés', () => {
      appModule.renderCoffees([]);
      const grid = document.getElementById('coffee-grid');
      expect(grid.textContent).toContain('No hay cafés disponibles');
    });
  });

});
