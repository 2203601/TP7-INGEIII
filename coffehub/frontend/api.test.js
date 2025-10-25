// ✅ No hace falta redefinir TextEncoder/TextDecoder — ya están en jest.setup.js

// Importamos directamente las funciones reales del frontend
import {
  getBackendURL,
  toggleForm,
  cancelEdit,
  editCoffee,
  deleteCoffee,
  renderCoffees,
  updateStats,
  handleFormSubmit
} from './app.js';

// Importamos JSDOM si necesitamos simular un DOM
import { JSDOM } from 'jsdom';

describe('Pruebas del Frontend', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Crear un DOM simulado antes de cada test
    dom = new JSDOM(`<!DOCTYPE html><body>
      <form id="coffeeForm"></form>
      <div id="coffeeList"></div>
      <div id="stats"></div>
    </body>`);

    document = dom.window.document;
    window = dom.window;

    global.window = window;
    global.document = document;
    global.fetch = jest.fn(); // mockeamos fetch
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- TESTS ----

  test('getBackendURL devuelve la URL base del backend', () => {
    const url = getBackendURL();
    expect(typeof url).toBe('string');
    expect(url.startsWith('http')).toBe(true);
  });

  test('toggleForm alterna la visibilidad del formulario', () => {
    const form = document.getElementById('coffeeForm');
    form.style.display = 'none';
    toggleForm();
    expect(form.style.display).toBe('block');
    toggleForm();
    expect(form.style.display).toBe('none');
  });

  test('cancelEdit limpia el formulario', () => {
    const form = document.getElementById('coffeeForm');
    form.innerHTML = '<input id="name" value="Latte">';
    cancelEdit();
    expect(form.querySelector('#name').value).toBe('');
  });

  test('renderCoffees renderiza elementos en la lista', () => {
    const coffeeList = document.getElementById('coffeeList');
    const coffees = [
      { id: 1, name: 'Latte' },
      { id: 2, name: 'Espresso' }
    ];
    renderCoffees(coffees);
    expect(coffeeList.innerHTML).toContain('Latte');
    expect(coffeeList.innerHTML).toContain('Espresso');
  });

  test('updateStats actualiza los valores de estadísticas', () => {
    const statsDiv = document.getElementById('stats');
    const stats = { total: 5, avgRating: 4.2 };
    updateStats(stats);
    expect(statsDiv.textContent).toContain('5');
    expect(statsDiv.textContent).toContain('4.2');
  });

  
});
