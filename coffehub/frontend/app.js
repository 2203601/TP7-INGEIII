// ☕ CoffeeHub Frontend - API URL DINÁMICA
// 🔧 Detectar automáticamente la URL del backend según el ambiente

// ================================
// 📦 FUNCIONES EXPORTABLES
// ================================

export function getBackendURL() {
  // Usar global.window para compatibilidad con tests
  const win = typeof window !== 'undefined' ? window : global.window;
  const hostname = win?.location?.hostname || 'localhost';
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  if (hostname.includes('coffeehub-front-qa')) {
    return 'https://coffeehub-back-qa-argeftdrb3dkb9du.brazilsouth-01.azurewebsites.net';
  }
  
  if (hostname.includes('coffeehub-front-prod')) {
    return 'https://coffeehub-back-prod-bzgaa5ekbed7fret.brazilsouth-01.azurewebsites.net';
  }
  
  return 'https://coffeehub-back-qa-argeftdrb3dkb9du.brazilsouth-01.azurewebsites.net';
}

// Variable global para tracking de edición
let editingCoffeeId = null;

export function getEditingCoffeeId() {
  return editingCoffeeId;
}

export function setEditingCoffeeId(id) {
  editingCoffeeId = id;
}

export function toggleForm() {
  const doc = typeof document !== 'undefined' ? document : global.document;
  const form = doc.getElementById("add-form");
  const isHidden = form.style.display === "none" || form.style.display === "";
  form.style.display = isHidden ? "block" : "none";
  
  if (!isHidden) {
    cancelEdit();
  }
}

export function cancelEdit() {
  const doc = typeof document !== 'undefined' ? document : global.document;
  editingCoffeeId = null;
  doc.getElementById("coffee-form").reset();
  doc.getElementById("form-title").textContent = "Agregar Nuevo Café";
  doc.getElementById("submit-btn").innerHTML = "✅ Agregar Café";
  doc.getElementById("cancel-btn").style.display = "none";
  doc.getElementById("add-form").style.display = "none";
}

export function editCoffee(coffee) {
  const doc = typeof document !== 'undefined' ? document : global.document;
  editingCoffeeId = coffee._id;
  
  doc.getElementById("name").value = coffee.name;
  doc.getElementById("origin").value = coffee.origin;
  doc.getElementById("type").value = coffee.type;
  doc.getElementById("price").value = coffee.price;
  doc.getElementById("roast").value = coffee.roast;
  doc.getElementById("rating").value = coffee.rating;
  doc.getElementById("description").value = coffee.description || '';
  
  doc.getElementById("form-title").textContent = "Editar Café";
  doc.getElementById("submit-btn").innerHTML = "💾 Guardar Cambios";
  doc.getElementById("cancel-btn").style.display = "inline-block";
  doc.getElementById("add-form").style.display = "block";
  
  // Solo hacer scroll en el browser real
  if (typeof document !== 'undefined' && doc.getElementById("add-form").scrollIntoView) {
    doc.getElementById("add-form").scrollIntoView({ behavior: 'smooth' });
  }
}

export async function deleteCoffee(id, name) {
  const win = typeof window !== 'undefined' ? window : global.window;
  const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;
  const confirmFn = typeof confirm !== 'undefined' ? confirm : global.confirm;
  const alertFn = typeof alert !== 'undefined' ? alert : global.alert;
  
  if (!confirmFn(`¿Estás seguro de eliminar "${name}"?`)) {
    return;
  }
  
  try {
    const response = await fetchFn(`${getBackendURL()}/api/products/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    await renderCoffees();
    await updateStats();
    alertFn('✅ Café eliminado exitosamente!');
  } catch (error) {
    console.error('❌ Error al eliminar café:', error);
    alertFn(`⚠️ Error al eliminar café: ${error.message}`);
  }
}

export async function renderCoffees() {
  const doc = typeof document !== 'undefined' ? document : global.document;
  const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;
  const grid = doc.getElementById("coffee-grid");
  
  try {
    const res = await fetchFn(`${getBackendURL()}/api/products`);
    if (!res.ok) {
      grid.innerHTML = '<p class="error">❌ Error al conectar con el servidor</p>';
      return;
    }
    const coffees = await res.json();
    
    if (coffees.length === 0) {
      grid.innerHTML = '<p class="no-data">No hay cafés registrados. ¡Agrega uno!</p>';
      return;
    }
    
    grid.innerHTML = coffees.map(c => `
      <div class="coffee-card">
        <h3>${c.name}</h3>
        <p><strong>Origen:</strong> ${c.origin}</p>
        <p><strong>Tipo:</strong> ${c.type}</p>
        <p><strong>Precio:</strong> $${c.price}</p>
        <p><strong>Tostado:</strong> ${c.roast}</p>
        <p><strong>Rating:</strong> ${c.rating} ⭐</p>
        <p>${c.description || 'Sin descripción'}</p>
        <div class="card-actions">
          <button onclick='editCoffee(${JSON.stringify(c).replace(/'/g, "&#39;")})'>✏️ Editar</button>
          <button onclick='deleteCoffee("${c._id}", "${c.name}")'>🗑️ Eliminar</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error('❌ Error al cargar cafés:', error);
    grid.innerHTML = '<p class="error">❌ Error al conectar con el servidor</p>';
  }
}

export async function updateStats() {
  const doc = typeof document !== 'undefined' ? document : global.document;
  const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;
  
  try {
    const res = await fetchFn(`${getBackendURL()}/api/stats`);
    if (!res.ok) {
      return;
    }
    const stats = await res.json();
    
    doc.getElementById("total-coffees").textContent = stats.total || 0;
    doc.getElementById("avg-price").textContent = `$${stats.avgPrice || 0}`;
    doc.getElementById("popular-origin").textContent = stats.popularOrigin || "N/A";
  } catch (error) {
    console.error('❌ Error al cargar estadísticas:', error);
  }
}

export async function handleFormSubmit(e) {
  const doc = typeof document !== 'undefined' ? document : global.document;
  const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;
  const alertFn = typeof alert !== 'undefined' ? alert : global.alert;
  
  e.preventDefault();
  
  const coffee = {
    name: doc.getElementById("name").value,
    origin: doc.getElementById("origin").value,
    type: doc.getElementById("type").value,
    price: parseFloat(doc.getElementById("price").value),
    roast: doc.getElementById("roast").value,
    rating: parseFloat(doc.getElementById("rating").value),
    description: doc.getElementById("description").value || "Sin descripción"
  };
  
  try {
    let response;
    
    if (editingCoffeeId) {
      response = await fetchFn(`${getBackendURL()}/api/products/${editingCoffeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coffee)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      alertFn('✅ Café actualizado!');
    } else {
      response = await fetchFn(`${getBackendURL()}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coffee)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      alertFn('✅ Café agregado!');
    }
    
    cancelEdit();
    await renderCoffees();
    await updateStats();
  } catch (error) {
    console.error('❌ Error al guardar café:', error);
    alertFn(`❌ Error al guardar el café`);
  }
}

// ================================
// 🌐 CÓDIGO QUE SOLO SE EJECUTA EN EL BROWSER
// ================================

if (typeof window !== 'undefined') {
  const API_URL = getBackendURL();
  console.log('🔗 API URL configurada:', API_URL);
  console.log('🌐 Hostname actual:', window.location.hostname);
  
  // Exponer funciones globalmente para onclick en HTML
  window.toggleForm = toggleForm;
  window.cancelEdit = cancelEdit;
  window.editCoffee = editCoffee;
  window.deleteCoffee = deleteCoffee;
  
  // Event listener del formulario
  document.getElementById("coffee-form")?.addEventListener("submit", handleFormSubmit);
  
  // Inicializar
  renderCoffees();
  updateStats();
}