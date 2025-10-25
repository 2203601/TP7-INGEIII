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
      <input id="type" />
      <input id="price" />
      <input id="rating" />
      <input id="roast" />
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
  
  // Mock de window.location
  delete window.location;
  window.location = { hostname: 'localhost' };
  
  // Mock de fetch
  global.fetch = jest.fn();
  
  // Mock de confirm y alert
  global.confirm = jest.fn();
  global.alert = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

// -----------------------------
// 🔹 Tests Adicionales
// -----------------------------
describe('CoffeeHub Frontend - Tests Adicionales', () => {

  // Tests para getBackendURL() - Cobertura: 0% → 100%
  describe('getBackendURL()', () => {
    test('debe retornar localhost URL cuando hostname incluye localhost', () => {
      window.location.hostname = 'localhost';
      expect(appModule.getBackendURL()).toBe('http://localhost:3000');
    });

    test('debe retornar QA URL cuando hostname incluye qa', () => {
      window.location.hostname = 'coffeehub-qa.azurewebsites.net';
      expect(appModule.getBackendURL()).toBe('https://coffeehub-back-qa.azurewebsites.net');
    });

    test('debe retornar PROD URL cuando hostname incluye prod', () => {
      window.location.hostname = 'coffeehub-prod.azurewebsites.net';
      expect(appModule.getBackendURL()).toBe('https://coffeehub-back-prod.azurewebsites.net');
    });

    test('debe retornar QA URL como fallback para otros hostnames', () => {
      window.location.hostname = 'example.com';
      expect(appModule.getBackendURL()).toBe('https://coffeehub-back-qa.azurewebsites.net');
    });
  });

  // Tests para deleteCoffee() - Cobertura: 0% → 100%
  describe('deleteCoffee()', () => {
    test('debe cancelar eliminación si el usuario no confirma', async () => {
      global.confirm.mockReturnValue(false);
      const mockAlert = jest.fn();
      
      await appModule.deleteCoffee('123', 'Café Test', mockAlert);
      
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    test('debe eliminar café exitosamente cuando se confirma', async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });
      const mockAlert = jest.fn();
      
      await appModule.deleteCoffee('123', 'Café Test', mockAlert);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coffees/123'),
        { method: 'DELETE' }
      );
      expect(mockAlert).toHaveBeenCalledWith('✅ Café eliminado exitosamente!');
    });

    test('debe manejar error de red al eliminar', async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockRejectedValue(new Error('Network error'));
      const mockAlert = jest.fn();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      await appModule.deleteCoffee('123', 'Café Test', mockAlert);
      
      expect(consoleError).toHaveBeenCalledWith(
        '❌ Error al eliminar café:',
        expect.any(Error)
      );
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Error al eliminar café')
      );
      
      consoleError.mockRestore();
    });

    test('debe manejar respuesta HTTP no exitosa', async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: false, status: 404 });
      const mockAlert = jest.fn();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      await appModule.deleteCoffee('123', 'Café Test', mockAlert);
      
      expect(consoleError).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Error al eliminar café')
      );
      
      consoleError.mockRestore();
    });
  });

  // Tests para handleFormSubmit() - Cobertura: 0% → 100%
  describe('handleFormSubmit()', () => {
    beforeEach(() => {
      document.getElementById('name').value = 'Café Nuevo';
      document.getElementById('origin').value = 'Colombia';
      document.getElementById('type').value = 'Arábica';
      document.getElementById('price').value = '15';
      document.getElementById('rating').value = '4';
      document.getElementById('roast').value = 'Medium';
      document.getElementById('description').value = 'Excelente café';
    });

    test('debe enviar datos del formulario correctamente', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      
      await appModule.handleFormSubmit();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/coffees'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Café Nuevo')
        })
      );
      expect(global.alert).toHaveBeenCalledWith('✅ Café agregado exitosamente!');
    });

    test('debe limpiar formulario después de envío exitoso', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      
      await appModule.handleFormSubmit();
      
      // Verificar que el formulario fue reseteado (cancelEdit fue llamado)
      expect(document.getElementById('form-title').textContent).toBe('Agregar Nuevo Café');
      expect(document.getElementById('submit-btn').innerHTML).toBe('Agregar Café');
    });

    test('debe manejar error de red al enviar', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      await appModule.handleFormSubmit();
      
      expect(consoleError).toHaveBeenCalledWith(
        '❌ Error al agregar café:',
        expect.any(Error)
      );
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Error al agregar café')
      );
      
      consoleError.mockRestore();
    });

    test('debe manejar respuesta HTTP no exitosa', async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 500 });
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      await appModule.handleFormSubmit();
      
      expect(consoleError).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Error al agregar café')
      );
      
      consoleError.mockRestore();
    });

    test('debe incluir todos los campos del café en el request', async () => {
      global.fetch.mockResolvedValue({ ok: true });
      
      await appModule.handleFormSubmit();
      
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body).toEqual({
        name: 'Café Nuevo',
        origin: 'Colombia',
        type: 'Arábica',
        price: '15',
        rating: '4',
        roast: 'Medium',
        description: 'Excelente café'
      });
    });
  });

  // Tests para updateStats() - Mejora cobertura de branches
  describe('updateStats() - casos edge', () => {
    test('debe manejar cuando los elementos no existen', async () => {
      document.body.innerHTML = '<div></div>'; // DOM sin elementos necesarios
      
      // No debería lanzar error aunque los elementos no existan
      await expect(appModule.updateStats({ total: 5 })).resolves.not.toThrow();
    });

    test('debe manejar valores null en estadísticas', async () => {
      await appModule.updateStats({ total: null, avgPrice: null, popularOrigin: null });
      
      expect(document.getElementById('total-coffees').textContent).toBe('0');
      expect(document.getElementById('avg-price').textContent).toBe('$0');
      expect(document.getElementById('popular-origin').textContent).toBe('N/A');
    });

    test('debe usar valores por defecto cuando stats es undefined', async () => {
      await appModule.updateStats();
      
      expect(document.getElementById('total-coffees').textContent).toBe('0');
      expect(document.getElementById('avg-price').textContent).toBe('$0');
      expect(document.getElementById('popular-origin').textContent).toBe('N/A');
    });

    test('debe formatear correctamente el precio con decimales', async () => {
      await appModule.updateStats({ total: 5, avgPrice: 14.99, popularOrigin: 'Brasil' });
      
      expect(document.getElementById('avg-price').textContent).toBe('$14.99');
    });
  });

  // Tests para init() - Cobertura: 0% → 100%
  describe('init()', () => {
    test('debe ejecutarse sin errores', () => {
      // Verificamos que los elementos existen para updateStats
      expect(document.getElementById('total-coffees')).toBeTruthy();
      expect(document.getElementById('avg-price')).toBeTruthy();
      expect(document.getElementById('popular-origin')).toBeTruthy();
      
      // Ejecutamos init y verificamos que no lanza errores
      expect(() => appModule.init()).not.toThrow();
      
      // Verificamos que las estadísticas se inicializan con valores por defecto
      expect(document.getElementById('total-coffees').textContent).toBe('0');
    });

    test('debe inicializar estadísticas correctamente', () => {
      // Limpiamos valores previos
      document.getElementById('total-coffees').textContent = '';
      document.getElementById('avg-price').textContent = '';
      document.getElementById('popular-origin').textContent = '';
      
      appModule.init();
      
      // Después de init(), las estadísticas deben tener valores por defecto
      expect(document.getElementById('total-coffees').textContent).toBe('0');
      expect(document.getElementById('avg-price').textContent).toBe('$0');
      expect(document.getElementById('popular-origin').textContent).toBe('N/A');
    });
  });

  // Tests adicionales para toggleForm() - casos edge
  describe('toggleForm() - casos edge', () => {
    test('debe manejar cuando el formulario no existe', () => {
      document.body.innerHTML = '';
      
      expect(() => appModule.toggleForm()).not.toThrow();
    });

    test('debe mostrar formulario cuando display está vacío', () => {
      const form = document.getElementById('coffee-form');
      form.style.display = '';
      
      appModule.toggleForm();
      
      expect(form.style.display).toBe('block');
    });
  });

  // Tests adicionales para cancelEdit() - casos edge
  describe('cancelEdit() - casos edge', () => {
    test('debe manejar cuando el formulario no existe', () => {
      document.body.innerHTML = '';
      
      expect(() => appModule.cancelEdit()).not.toThrow();
    });

    test('debe limpiar el ID de edición', () => {
      appModule.setEditingCoffeeId('123');
      appModule.cancelEdit();
      
      expect(appModule.getEditingCoffeeId()).toBeNull();
    });
  });

  // Tests adicionales para editCoffee() - casos edge
  describe('editCoffee() - casos edge', () => {
    test('debe manejar cuando el formulario no existe', () => {
      document.body.innerHTML = '';
      
      expect(() => appModule.editCoffee({ id: '1', name: 'Test' })).not.toThrow();
    });

    test('debe manejar café con todos los campos null', () => {
      appModule.editCoffee({
        id: '1',
        name: null,
        origin: null,
        type: null,
        price: null,
        rating: null,
        roast: null,
        description: null
      });
      
      expect(document.getElementById('name').value).toBe('');
      expect(document.getElementById('origin').value).toBe('');
      expect(document.getElementById('type').value).toBe('');
      expect(document.getElementById('price').value).toBe('');
      expect(document.getElementById('rating').value).toBe('');
      expect(document.getElementById('roast').value).toBe('');
      expect(document.getElementById('description').value).toBe('');
    });

    test('debe establecer correctamente el ID de edición', () => {
      const coffee = {
        id: '456',
        name: 'Café Test',
        origin: 'Colombia',
        type: 'Arábica',
        price: '12',
        rating: '5',
        roast: 'Medium',
        description: 'Delicioso'
      };
      
      appModule.editCoffee(coffee);
      
      expect(appModule.getEditingCoffeeId()).toBe('456');
    });
  });

  // Tests adicionales para renderCoffees() - casos edge
  describe('renderCoffees() - casos edge', () => {
    test('debe manejar cuando el grid no existe', () => {
      document.body.innerHTML = '';
      
      expect(() => appModule.renderCoffees([{ name: 'Test' }])).not.toThrow();
    });

    test('debe manejar array null', () => {
      appModule.renderCoffees(null);
      const grid = document.getElementById('coffee-grid');
      
      expect(grid.textContent).toContain('No hay cafés disponibles');
    });

    test('debe limpiar el grid antes de renderizar', () => {
      const grid = document.getElementById('coffee-grid');
      grid.innerHTML = '<div>Contenido anterior</div>';
      
      appModule.renderCoffees([{ name: 'Nuevo Café' }]);
      
      expect(grid.textContent).not.toContain('Contenido anterior');
      expect(grid.textContent).toContain('Nuevo Café');
    });

    test('debe renderizar múltiples cafés correctamente', () => {
      const coffees = [
        { name: 'Café 1' },
        { name: 'Café 2' },
        { name: 'Café 3' }
      ];
      
      appModule.renderCoffees(coffees);
      const grid = document.getElementById('coffee-grid');
      
      expect(grid.children.length).toBe(3);
      expect(grid.textContent).toContain('Café 1');
      expect(grid.textContent).toContain('Café 2');
      expect(grid.textContent).toContain('Café 3');
    });
  });

  // Tests para setEditingCoffeeId() y getEditingCoffeeId()
  describe('setEditingCoffeeId() y getEditingCoffeeId()', () => {
    test('debe establecer y obtener el ID correctamente', () => {
      appModule.setEditingCoffeeId('789');
      expect(appModule.getEditingCoffeeId()).toBe('789');
    });

    test('debe permitir establecer null', () => {
      appModule.setEditingCoffeeId('123');
      appModule.setEditingCoffeeId(null);
      expect(appModule.getEditingCoffeeId()).toBeNull();
    });
  });

});