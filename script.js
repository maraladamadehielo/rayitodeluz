// ========================================
// Rayito de Luz ✨
// JavaScript Principal
// By maraladamadehielo
// ========================================

// CONFIGURACIÓN DE ADMINISTRADOR 
// ========================================
const ADMIN_CONFIG = {
  username: 'Rayodeluz',           // CAMBIA ESTO por tu usuario
  password: 'rayito2025',          // CAMBIA ESTO por tu contraseña
  secretCode: 'RYL2024'   // Código secreto para restablecer
};
// ========================================

// Variables globales
let isAdmin = false;
let currentPage = 'inicio';
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos

// Año automático en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// ========================================
// NAVEGACIÓN
// ========================================
function navigateTo(pageName) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Mostrar página seleccionada
  document.getElementById(`page-${pageName}`).classList.add('active');
  
  // Actualizar menú activo
  document.querySelectorAll('nav button[data-page]').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.page === pageName) btn.classList.add('active');
  });
  
  currentPage = pageName;
  
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Cargar datos según la página
  if (pageName === 'galeria') loadGallery();
  if (pageName === 'material') loadMaterials();
}

// ========================================
// SISTEMA DE ALMACENAMIENTO
// ========================================
async function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);
    return false;
  }
}

async function loadData(key) {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data)};
  } catch (error) {
    return null;
  }
}

async function deleteData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

// ========================================
// SISTEMA DE LOGIN SEGURO
// ========================================
async function checkLoginLockout() {
  const lockoutData = await loadData('admin-lockout');
  if (lockoutData) {
    const now = Date.now();
    if (now < lockoutData.until) {
      const remainingMinutes = Math.ceil((lockoutData.until - now) / 60000);
      return {
        locked: true,
        minutes: remainingMinutes
      };
    } else {
      await deleteData('admin-lockout');
      loginAttempts = 0;
    }
  }
  return { locked: false };
}

async function setLoginLockout() {
  const lockoutUntil = Date.now() + LOCKOUT_TIME;
  await saveData('admin-lockout', { until: lockoutUntil });
}

async function loginAdmin() {
  // Verificar lockout
  const lockout = await checkLoginLockout();
  if (lockout.locked) {
    alert(`❌ Demasiados intentos fallidos. Espera ${lockout.minutes} minutos.`);
    return;
  }
  
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value;
  
  if (!username || !password) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  // Verificar credenciales contra la configuración
  if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
    // Login exitoso
    isAdmin = true;
    loginAttempts = 0;
    
    // Actualizar UI
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminGalleryControls').style.display = 'block';
    document.getElementById('adminMaterialControls').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `¡Bienvenido, ${username}!`;
    
    // Limpiar campos
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    
    // Guardar sesión
    await saveData('admin-session', {
      active: true,
      username: username,
      timestamp: Date.now()
    });
    
    // Recargar datos para mostrar controles de admin
    if (currentPage === 'galeria') loadGallery();
    if (currentPage === 'material') loadMaterials();
    
    showNotification('✅ Sesión iniciada correctamente');
  } else {
    // Login fallido
    loginAttempts++;
    
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      await setLoginLockout();
      alert(`❌ Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.`);
      loginAttempts = 0;
    } else {
      const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts;
      alert(`❌ Usuario o contraseña incorrectos. Intentos restantes: ${remaining}`);
    }
  }
}

function logoutAdmin() {
  if (!confirm('¿Cerrar sesión de administrador?')) return;
  
  isAdmin = false;
  
  // Limpiar sesión
  deleteData('admin-session');
  
  // Actualizar UI
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminGalleryControls').style.display = 'none';
  document.getElementById('adminMaterialControls').style.display = 'none';
  
  closeAdminModal();
  
  // Recargar datos para ocultar controles de admin
  if (currentPage === 'galeria') loadGallery();
  if (currentPage === 'material') loadMaterials();
  
  showNotification('👋 Sesión cerrada');
}

function showResetForm() {
  const code = prompt('⚠️ Ingresa el código de seguridad para restablecer:');
  
  if (code === ADMIN_CONFIG.secretCode) {
    alert('⚠️ IMPORTANTE: Las credenciales predeterminadas son:\n\nUsuario: admin\nContraseña: rayito2024\n\nPuedes cambiarlas editando ADMIN_CONFIG en script.js');
  } else {
    alert('❌ Código de seguridad incorrecto');
  }
}

// Verificar sesión al abrir modal
async function checkExistingSession() {
  const session = await loadData('admin-session');
  if (session && session.active) {
    const sessionAge = Date.now() - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (sessionAge < maxAge) {
      isAdmin = true;
      document.getElementById('adminLogin').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      document.getElementById('adminGalleryControls').style.display = 'block';
      document.getElementById('adminMaterialControls').style.display = 'block';
      document.getElementById('welcomeMessage').textContent = `¡Bienvenido de nuevo, ${session.username}!`;
      
      if (currentPage === 'galeria') loadGallery();
      if (currentPage === 'material') loadMaterials();
    } else {
      await deleteData('admin-session');
    }
  }
}

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: #4caf50;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Agregar animaciones de notificación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ========================================
// GALERÍA
// ========================================
async function loadGallery() {
  const images = await loadData('gallery-images') || [];
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  
  if (images.length === 0) {
    gallery.innerHTML = '<div class="empty-state">No hay imágenes aún. El administrador puede agregar contenido.</div>';
    return;
  }
  
  images.forEach((imgData, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = imgData.src;
    img.alt = imgData.alt || 'Imagen de galería';
    img.onclick = () => window.open(imgData.src, '_blank');
    
    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.onclick = () => deleteImage(index);
      item.appendChild(deleteBtn);
    }
    
    item.appendChild(img);
    gallery.appendChild(item);
  });
}

async function deleteImage(index) {
  if (!isAdmin || !confirm('¿Eliminar esta imagen?')) return;
  
  const images = await loadData('gallery-images') || [];
  images.splice(index, 1);
  await saveData('gallery-images', images);
  loadGallery();
  showNotification('🗑️ Imagen eliminada');
}

// Evento para agregar imágenes
document.getElementById('addImageInput').addEventListener('change', async (e) => {
  if (!isAdmin) return;
  
  const files = e.target.files;
  if (!files.length) return;

  showNotification('📤 Subiendo imágenes...');

  const readerPromises = [...files].map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = ev => resolve({
        src: ev.target.result,
        alt: file.name,
        date: new Date().toISOString()
      });
      reader.readAsDataURL(file);
    });
  });

  const newImages = await Promise.all(readerPromises);
  const images = await loadData('gallery-images') || [];
  const updated = [...images, ...newImages];
  
  await saveData('gallery-images', updated);
  loadGallery();
  e.target.value = '';
  
  showNotification(`✅ ${newImages.length} imagen(es) agregada(s)`);
});

// ========================================
// MATERIALES DIDÁCTICOS
// ========================================
async function loadMaterials() {
  let materials = await loadData('materials');
  
  // Si no hay materiales, crear ejemplos iniciales
  if (!materials) {
    materials = [
      { 
        id: '1', 
        title: 'Paquete básico', 
        description: '20 fichas + guía para padres', 
        link: '#' 
      },
      { 
        id: '2', 
        title: 'Paquete creativo', 
        description: 'Actividades y manualidades imprimibles', 
        link: '#' 
      }
    ];
    await saveData('materials', materials);
  }
  
  const container = document.getElementById('materialsContainer');
  container.innerHTML = '';
  
  if (materials.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay materiales disponibles.</div>';
    return;
  }
  
  materials.forEach(material => {
    const card = document.createElement('div');
    card.className = 'material-card';
    
    const h4 = document.createElement('h4');
    h4.textContent = material.title;
    
    const p = document.createElement('p');
    p.textContent = material.description;
    
    const actions = document.createElement('div');
    actions.className = 'material-actions';
    
    // Enlace de descarga o placeholder
    if (material.link && material.link !== '#') {
      const link = document.createElement('a');
      link.className = 'chip';
      link.href = material.link;
      link.target = '_blank';
      link.textContent = 'Descargar';
      actions.appendChild(link);
    } else {
      const noLink = document.createElement('span');
      noLink.className = 'chip';
      noLink.style.opacity = '0.5';
      noLink.textContent = 'Sin enlace';
      actions.appendChild(noLink);
    }
    
    // Botón de eliminar (solo para admin)
    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.onclick = () => deleteMaterial(material.id);
      actions.appendChild(deleteBtn);
    }
    
    card.appendChild(h4);
    card.appendChild(p);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

async function addMaterial() {
  const title = document.getElementById('materialTitle').value.trim();
  const description = document.getElementById('materialDesc').value.trim();
  const link = document.getElementById('materialLink').value.trim();
  
  if (!title || !description) {
    alert('Por favor completa título y descripción');
    return;
  }
  
  const materials = await loadData('materials') || [];
  const newMaterial = {
    id: Date.now().toString(),
    title,
    description,
    link: link || '#'
  };
  
  materials.push(newMaterial);
  await saveData('materials', materials);
  
  closeAddMaterialModal();
  loadMaterials();
  
  // Limpiar formulario
  document.getElementById('materialTitle').value = '';
  document.getElementById('materialDesc').value = '';
  document.getElementById('materialLink').value = '';
  
  showNotification('✅ Material agregado');
}

async function deleteMaterial(id) {
  if (!isAdmin || !confirm('¿Eliminar este material?')) return;
  
  const materials = await loadData('materials') || [];
  const filtered = materials.filter(m => m.id !== id);
  await saveData('materials', filtered);
  loadMaterials();
  showNotification('🗑️ Material eliminado');
}

// ========================================
// MODALES
// ========================================
async function openAdminModal() {
  document.getElementById('adminModal').classList.add('active');
  await checkExistingSession();
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function openAddMaterialModal() {
  if (!isAdmin) {
    alert('Debes iniciar sesión como administrador');
    return;
  }
  document.getElementById('addMaterialModal').classList.add('active');
}

function closeAddMaterialModal() {
  document.getElementById('addMaterialModal').classList.remove('active');
}

// Cerrar modales al hacer clic fuera del contenido
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// Cerrar modales con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

// ========================================
// CONTACTO
// ========================================
function sendWhatsApp() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  
  if (!message) {
    alert('Por favor escribe un mensaje');
    return;
  }
  
  const texto = `Hola, soy ${name || "estoy interesado"} 👋%0A%0A${message}`;
  const phoneNumber = '573132536013'; // CAMBIAR POR TU NÚMERO REAL
  window.open(`https://wa.me/${phoneNumber}?text=${texto}`, "_blank");
}

function sendEmail() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  
  if (!message) {
    alert('Por favor escribe un mensaje');
    return;
  }
  
  const subject = `Consulta de ${name || "interesado"} - Rayito de Luz`;
  const body = `Nombre: ${name || "No proporcionado"}%0A%0AMensaje:%0A${message}`;
  const email = 'rayitodeluz@correo.com'; // CAMBIAR POR TU EMAIL REAL
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

// ========================================
// INICIALIZACIÓN
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  loadMaterials();
  checkExistingSession();
});

