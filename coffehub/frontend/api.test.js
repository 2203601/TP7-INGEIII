// ☕ CoffeeHub Frontend - Tests con Jest
// =======================================
import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';

// ✅ IMPORTAR FUNCIONES REALES DESDE APP.JS
import {
  getBackendURL,
  toggleForm,
  cancelEdit,
  editCoffee,
  deleteCoffee,
  renderCoffees,
  updateStats,
  handleFormSubmit,
  setEditingCoffeeId,
  getEditingCoffeeId
} from './app.js';

// ================================
// 🌐 SETUP DEL DOM
// ================================
let dom;
let window;
let document;

function setupDOM() {
  dom = new JSDOM(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoffeeHub - Tu Portal del Café</title>
</head>
<body>
  <div class="container">
    <header>
      <h1>☕ CoffeeHub</h1>
      <div class="subtitle">Descubre el mundo del café perfecto</div>
    </header>
    <div class="stats">
      <div class="stat-card">
        <span class="stat-number" id="total-coffees">0</span>
        <div class="stat-label">Cafés Registrados</div>
      </div>
      <div class="stat-card">
        <span class="stat-number" id="avg-price">$0</span>
        <div class="stat-label">Precio Promedio</div>
      </div>
      <div class="stat-card">
        <span class="stat-number" id="popular-origin">-</span>
        <div class="stat-label">Origen Popular</div>
      </div>
    </div>
    <div class="controls">
      <button class="btn" onclick="toggleForm()">➕ Agregar Café</button>
    </div>
    <div class="add-form" id="add-form" style="display:none;">
      <h3 class="form-title" id="form-title">Agregar Nuevo Café</h3>
      <form id="coffee-form">
        <input type="text" id="name" placeholder="Nombre del Café" required>
        <input type="text" id="origin" placeholder="Origen" required>
        <input type="text" id="type" placeholder="Tipo" required>
        <input type="number" id="price" step="0.01" placeholder="Precio (por libra)" required>
        <input type="text" id="roast" placeholder="Nivel de Tostado" required>
        <input type="number" id="rating" min="1" max="5" step="0.1" placeholder="Calificación (1-5)" required>
        <textarea id="description" placeholder="Descripción"></textarea>
        <div class="form-buttons">
          <button type="button" class="btn btn-secondary" id="cancel-btn" style="display:none;" onclick="cancelEdit()">Cancelar</button>
          <button type="submit" class="btn" id="submit-btn">✅ Agregar Café</button>
        </div>
      </form>
    </div>
    <div class="coffee-grid" id="coffee-grid">
      <div class="loading">Cargando cafés...</div>
    </div>
  </div>
</body>
</html>
`, {
    url: 'http://localhost:8080',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  window = dom.window;
  document = dom.window.document;
  
  global.window = window;
  global.document = document;
  global.navigator = window.navigator;
}

// ================================
// 🎭 MOCKS
// ================================
global.fetch = jest.fn();
global.alert = jest.fn();
global.confirm = jest.fn();

// ================================
// 🧪 TESTS
// ================================

describe('CoffeeHub Frontend', () => {
  
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    fetch.mockClear();
    alert.mockClear();
    confirm.mockClear();
    setEditingCoffeeId(null);
  });

  // ================================
  // TESTS: getBackendURL()
  // ================================
  describe('getBackendURL()', () => {
    
    test('debe retornar URL local para localhost', () => {
      expect(getBackendURL()).toBe('http://localhost:4000');
    });

    test('debe retornar URL de QA para ambiente QA', () => {
      delete global.window.location;
      global.window.location = { hostname: 'coffeehub-front-qa-test.azurewebsites.net' };
      
      const result = getBackendURL();
      
      expect(result).toContain('coffeehub-back-qa');
    });

    test('debe retornar URL de PROD para ambiente PROD', () => {
      delete global.window.location;
      global.window.location = { hostname: 'coffeehub-front-prod-test.azurewebsites.net' };
      
      const result = getBackendURL();
      
      expect(result).toContain('coffeehub-back-prod');
    });

    test('debe usar fallback para hostname desconocido', () => {
      delete global.window.location;
      global.window.location = { hostname: 'unknown-domain.com' };
      
      const result = getBackendURL();
      
      expect(result).toContain('coffeehub-back-qa');
    });
  });

  // ================================
  // TESTS: toggleForm()
  // ================================
  describe('toggleForm()', () => {
    test('debe mostrar formulario cuando está oculto', () => {
      const form = document.getElementById('add-form');
      form.style.display = 'none';
      
      toggleForm();
      
      expect(form.style.display).toBe('block');
    });

    test('debe ocultar formulario cuando está visible', () => {
      const form = document.getElementById('add-form');
      form.style.display = 'block';
      
      toggleForm();
      
      expect(form.style.display).toBe('none');
    });

    test('debe cancelar edición al cerrar formulario', () => {
      const form = document.getElementById('add-form');
      form.style.display = 'block';
      setEditingCoffeeId('123');
      
      toggleForm();
      
      expect(getEditingCoffeeId()).toBeNull();
    });
  });

  // ================================
  // TESTS: cancelEdit()
  // ================================
  describe('cancelEdit()', () => {
    test('debe resetear formulario correctamente', () => {
      document.getElementById('name').value = 'Café Test';
      document.getElementById('form-title').textContent = 'Editar Café';
      document.getElementById('submit-btn').innerHTML = '💾 Guardar Cambios';
      document.getElementById('cancel-btn').style.display = 'inline-block';
      setEditingCoffeeId('12345');
      
      cancelEdit();
      
      expect(document.getElementById('name').value).toBe('');
      expect(document.getElementById('form-title').textContent).toBe('Agregar Nuevo Café');
      expect(document.getElementById('submit-btn').innerHTML).toBe('✅ Agregar Café');
      expect(document.getElementById('cancel-btn').style.display).toBe('none');
      expect(document.getElementById('add-form').style.display).toBe('none');
      expect(getEditingCoffeeId()).toBeNull();
    });
  });

  // ================================
  // TESTS: editCoffee()
  // ================================
  describe('editCoffee()', () => {
    test('debe llenar formulario con datos del café', () => {
      const coffee = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Café Colombiano',
        origin: 'Colombia',
        type: 'Arábica',
        price: 15.99,
        roast: 'Medio',
        rating: 4.5,
        description: 'Café suave'
      };
      
      editCoffee(coffee);
      
      expect(document.getElementById('name').value).toBe('Café Colombiano');
      expect(document.getElementById('origin').value).toBe('Colombia');
      expect(document.getElementById('price').value).toBe('15.99');
      expect(document.getElementById('rating').value).toBe('4.5');
      expect(getEditingCoffeeId()).toBe('507f1f77bcf86cd799439011');
    });

    test('debe cambiar a modo edición', () => {
      const coffee = {
        _id: '123',
        name: 'Test',
        origin: 'Test',
        type: 'Test',
        price: 10,
        roast: 'Test',
        rating: 4,
        description: 'Test'
      };
      
      editCoffee(coffee);
      
      expect(document.getElementById('form-title').textContent).toBe('Editar Café');
      expect(document.getElementById('submit-btn').innerHTML).toBe('💾 Guardar Cambios');
      expect(document.getElementById('cancel-btn').style.display).toBe('inline-block');
      expect(document.getElementById('add-form').style.display).toBe('block');
    });

    test('debe manejar descripción vacía', () => {
      const coffee = {
        _id: '123',
        name: 'Test',
        origin: 'Test',
        type: 'Test',
        price: 10,
        roast: 'Test',
        rating: 4
      };
      
      editCoffee(coffee);
      
      expect(document.getElementById('description').value).toBe('');
    });
  });

  // ================================
  // TESTS: deleteCoffee()
  // ================================
  describe('deleteCoffee()', () => {
    test('debe eliminar café cuando usuario confirma', async () => {
      confirm.mockReturnValue(true);
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Eliminado' })
      });
      
      await deleteCoffee('507f1f77bcf86cd799439011', 'Café Test');
      
      expect(confirm).toHaveBeenCalledWith('¿Estás seguro de eliminar "Café Test"?');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/507f1f77bcf86cd799439011'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(alert).toHaveBeenCalledWith('✅ Café eliminado exitosamente!');
    });

    test('no debe eliminar si usuario cancela', async () => {
      confirm.mockReturnValue(false);
      
      await deleteCoffee('507f1f77bcf86cd799439011', 'Café Test');
      
      expect(confirm).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('debe manejar error de API', async () => {
      confirm.mockReturnValue(true);
      fetch.mockResolvedValue({ ok: false, status: 404 });
      
      await deleteCoffee('507f1f77bcf86cd799439011', 'Café Test');
      
      expect(alert).toHaveBeenCalled();
      expect(alert.mock.calls[0][0]).toContain('Error');
    });

    test('debe manejar error de red', async () => {
      confirm.mockReturnValue(true);
      fetch.mockRejectedValue(new Error('Network error'));
      
      await deleteCoffee('507f1f77bcf86cd799439011', 'Café Test');
      
      expect(alert).toHaveBeenCalled();
      expect(alert.mock.calls[0][0]).toContain('Error');
    });
  });

  // ================================
  // TESTS: renderCoffees()
  // ================================
  describe('renderCoffees()', () => {
    test('debe renderizar lista de cafés correctamente', async () => {
      const mockCoffees = [
        {
          _id: '1',
          name: 'Café Colombiano',
          origin: 'Colombia',
          type: 'Arábica',
          price: 15.99,
          roast: 'Medio',
          rating: 4.5,
          description: 'Café suave'
        },
        {
          _id: '2',
          name: 'Café Brasileño',
          origin: 'Brasil',
          type: 'Robusta',
          price: 12.99,
          roast: 'Oscuro',
          rating: 4.0,
          description: 'Café fuerte'
        }
      ];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockCoffees
      });
      
      await renderCoffees();
      
      const grid = document.getElementById('coffee-grid');
      expect(grid.innerHTML).toContain('Café Colombiano');
      expect(grid.innerHTML).toContain('Café Brasileño');
      expect(grid.innerHTML).toContain('Colombia');
      expect(grid.innerHTML).toContain('Brasil');
    });

    test('debe mostrar mensaje cuando no hay cafés', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
      
      await renderCoffees();
      
      const grid = document.getElementById('coffee-grid');
      expect(grid.innerHTML).toContain('No hay cafés registrados');
    });

    test('debe mostrar error cuando falla la API', async () => {
      fetch.mockResolvedValue({ ok: false });
      
      await renderCoffees();
      
      const grid = document.getElementById('coffee-grid');
      expect(grid.innerHTML).toContain('Error al conectar con el servidor');
    });

    test('debe incluir botones de editar y eliminar', async () => {
      const mockCoffees = [{
        _id: '1',
        name: 'Café Test',
        origin: 'Test',
        type: 'Test',
        price: 10,
        roast: 'Test',
        rating: 4,
        description: 'Test'
      }];
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockCoffees
      });
      
      await renderCoffees();
      
      const grid = document.getElementById('coffee-grid');
      expect(grid.innerHTML).toContain('Editar');
      expect(grid.innerHTML).toContain('Eliminar');
    });

    test('debe manejar error de red', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      await renderCoffees();
      
      const grid = document.getElementById('coffee-grid');
      expect(grid.innerHTML).toContain('Error al conectar con el servidor');
    });
  });

  // ================================
  // TESTS: updateStats()
  // ================================
  describe('updateStats()', () => {
    test('debe actualizar estadísticas correctamente', async () => {
      const mockStats = {
        total: 10,
        avgPrice: '15.50',
        popularOrigin: 'Colombia'
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats
      });
      
      await updateStats();
      
      expect(document.getElementById('total-coffees').textContent).toBe('10');
      expect(document.getElementById('avg-price').textContent).toBe('$15.50');
      expect(document.getElementById('popular-origin').textContent).toBe('Colombia');
    });

    test('debe manejar error de API sin romper', async () => {
      fetch.mockResolvedValue({ ok: false });
      
      await expect(updateStats()).resolves.not.toThrow();
    });

    test('debe manejar valores por defecto', async () => {
      const mockStats = {
        total: 0,
        avgPrice: 0,
        popularOrigin: 'N/A'
      };
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats
      });
      
      await updateStats();
      
      expect(document.getElementById('total-coffees').textContent).toBe('0');
      expect(document.getElementById('avg-price').textContent).toBe('$0');
      expect(document.getElementById('popular-origin').textContent).toBe('N/A');
    });

    test('debe manejar error de red sin romper', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      await expect(updateStats()).resolves.not.toThrow();
    });
  });

  // ================================
  // TESTS: handleFormSubmit()
  // ================================
  describe('handleFormSubmit()', () => {
    test('debe crear nuevo café exitosamente', async () => {
      document.getElementById('name').value = 'Café Nuevo';
      document.getElementById('origin').value = 'Guatemala';
      document.getElementById('type').value = 'Arábica';
      document.getElementById('price').value = '17.50';
      document.getElementById('roast').value = 'Claro';
      document.getElementById('rating').value = '4.7';
      document.getElementById('description').value = 'Excelente café';
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ _id: '123', name: 'Café Nuevo' })
      });
      
      const event = { preventDefault: jest.fn() };
      await handleFormSubmit(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Café Nuevo')
        })
      );
      expect(alert).toHaveBeenCalledWith('✅ Café agregado!');
    });

    test('debe actualizar café existente', async () => {
      setEditingCoffeeId('507f1f77bcf86cd799439011');
      
      document.getElementById('name').value = 'Café Actualizado';
      document.getElementById('origin').value = 'Colombia';
      document.getElementById('type').value = 'Arábica';
      document.getElementById('price').value = '18.99';
      document.getElementById('roast').value = 'Medio';
      document.getElementById('rating').value = '4.8';
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Actualizado' })
      });
      
      const event = { preventDefault: jest.fn() };
      await handleFormSubmit(event);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/507f1f77bcf86cd799439011'),
        expect.objectContaining({ method: 'PUT' })
      );
      expect(alert).toHaveBeenCalledWith('✅ Café actualizado!');
    });

    test('debe usar descripción por defecto si está vacía', async () => {
      document.getElementById('name').value = 'Café Sin Desc';
      document.getElementById('origin').value = 'Test';
      document.getElementById('type').value = 'Test';
      document.getElementById('price').value = '10';
      document.getElementById('roast').value = 'Test';
      document.getElementById('rating').value = '4';
      document.getElementById('description').value = '';
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ _id: '123' })
      });
      
      const event = { preventDefault: jest.fn() };
      await handleFormSubmit(event);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('Sin descripción')
        })
      );
    });

    test('debe manejar error de API', async () => {
      document.getElementById('name').value = 'Test';
      document.getElementById('origin').value = 'Test';
      document.getElementById('type').value = 'Test';
      document.getElementById('price').value = '10';
      document.getElementById('roast').value = 'Test';
      document.getElementById('rating').value = '4';
      
      fetch.mockResolvedValue({ ok: false });
      
      const event = { preventDefault: jest.fn() };
      await handleFormSubmit(event);
      
      expect(alert).toHaveBeenCalledWith('❌ Error al guardar el café');
    });

    test('debe manejar error de red', async () => {
      document.getElementById('name').value = 'Test';
      document.getElementById('origin').value = 'Test';
      document.getElementById('type').value = 'Test';
      document.getElementById('price').value = '10';
      document.getElementById('roast').value = 'Test';
      document.getElementById('rating').value = '4';
      
      fetch.mockRejectedValue(new Error('Network error'));
      
      const event = { preventDefault: jest.fn() };
      await handleFormSubmit(event);
      
      expect(alert).toHaveBeenCalledWith('❌ Error al guardar el café');
    });
  });
});