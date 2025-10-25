// app.js - CoffeeHub Frontend
// ============================

// -----------------------------
// 🌐 Estado interno
// -----------------------------
let editingCoffeeId = null;

// -----------------------------
// 🔹 Helpers
// -----------------------------
export function getEditingCoffeeId() {
  return editingCoffeeId;
}

export function setEditingCoffeeId(id) {
  editingCoffeeId = id;
}

// -----------------------------
// 🔹 Backend URL
// -----------------------------
export function getBackendURL() {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) return 'http://localhost:3000';
  if (hostname.includes('qa')) return 'https://coffeehub-back-qa.azurewebsites.net';
  if (hostname.includes('prod')) return 'https://coffeehub-back-prod.azurewebsites.net';
  return 'https://coffeehub-back-qa.azurewebsites.net'; // fallback
}

// -----------------------------
// 🔹 Formulario
// -----------------------------
export function toggleForm() {
  const form = document.getElementById('coffee-form');
  if (!form) return;

  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'block';
  } else {
    cancelEdit();
    form.style.display = 'none';
  }
}

export function cancelEdit() {
  const form = document.getElementById('coffee-form');
  if (!form) return;

  editingCoffeeId = null;

  form.reset();
  document.getElementById('form-title').textContent = 'Agregar Nuevo Café';
  document.getElementById('submit-btn').innerHTML = 'Agregar Café';
  document.getElementById('cancel-btn').style.display = 'none';
}

export function editCoffee(coffee) {
  const form = document.getElementById('coffee-form');
  if (!form) return;

  setEditingCoffeeId(coffee.id);

  document.getElementById('name').value = coffee.name || '';
  document.getElementById('origin').value = coffee.origin || '';
  document.getElementById('type').value = coffee.type || '';
  document.getElementById('price').value = coffee.price || '';
  document.getElementById('rating').value = coffee.rating || '';
  document.getElementById('roast').value = coffee.roast || '';
  document.getElementById('description').value = coffee.description || '';

  document.getElementById('form-title').textContent = 'Editar Café';
  document.getElementById('submit-btn').innerHTML = '💾 Guardar Cambios';
  document.getElementById('cancel-btn').style.display = 'inline-block';

  form.style.display = 'block';
}

// -----------------------------
// 🔹 CRUD
// -----------------------------
export async function deleteCoffee(id, name, alertFn = alert) {
  if (!confirm(`¿Eliminar café "${name}"?`)) return;

  try {
    const res = await fetch(`${getBackendURL()}/coffees/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    alertFn('✅ Café eliminado exitosamente!');
    updateStats(); // refrescar estadísticas
  } catch (error) {
    console.error('❌ Error al eliminar café:', error);
    alertFn(`⚠️ Error al eliminar café: ${error.message}`);
  }
}

export async function handleFormSubmit() {
  const coffee = {
    name: document.getElementById('name').value,
    origin: document.getElementById('origin').value,
    type: document.getElementById('type').value,
    price: document.getElementById('price').value,
    rating: document.getElementById('rating').value,
    roast: document.getElementById('roast').value,
    description: document.getElementById('description').value
  };

  try {
    const res = await fetch(`${getBackendURL()}/coffees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coffee)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    alert('✅ Café agregado exitosamente!');
    cancelEdit();
    updateStats();
  } catch (error) {
    console.error('❌ Error al agregar café:', error);
    alert(`⚠️ Error al agregar café: ${error.message}`);
  }
}

// -----------------------------
// 🔹 Render / Stats
// -----------------------------
export function renderCoffees(coffees) {
  const grid = document.getElementById('coffee-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (!coffees || coffees.length === 0) {
    grid.textContent = 'No hay cafés disponibles';
    return;
  }

  coffees.forEach(c => {
    const div = document.createElement('div');
    div.textContent = c.name;
    grid.appendChild(div);
  });
}

export async function updateStats(stats) {
  try {
    if (!stats) {
      stats = { total: 0, avgPrice: 0, popularOrigin: 'N/A' };
    }
    const totalEl = document.getElementById('total-coffees');
    const priceEl = document.getElementById('avg-price');
    const originEl = document.getElementById('popular-origin');

    if (totalEl) totalEl.textContent = stats.total || 0;
    if (priceEl) priceEl.textContent = `$${stats.avgPrice || 0}`;
    if (originEl) originEl.textContent = stats.popularOrigin || 'N/A';
  } catch (error) {
    console.error('❌ Error al cargar estadísticas:', error);
  }
}

// -----------------------------
// 🔹 Inicialización (solo frontend real)
// -----------------------------
export function init() {
  updateStats();
  // Aquí se podrían agregar event listeners si es necesario
  // document.getElementById('submit-btn').addEventListener('click', handleFormSubmit);
}
