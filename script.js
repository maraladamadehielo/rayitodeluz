// ========================================
// Rayito de Luz ✨
// JavaScript Principal
// By maraladamadehielo
// ========================================

// Variables globales
let isAdmin = false;
let currentPage = 'inicio';

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
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);
    return false;
  }
}

async function loadData(key) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : null;
  } catch (error) {
    return null;
  }
}

async function deleteData(key) {
  try {
    await window.storage.delete(key);
    return true;
  } catch (error) {
    return false;
  }
}

// ========================================
// SISTEMA DE CONTRASEÑA
// ========================================
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

async function checkPasswordSetup() {
  const hasPassword = await loadData('admin-password-hash');
  if (!hasPassword) {
    document.getElementById('setupPassword').style.display = 'block';
    document.getElementById('adminLogin').style.display = 'none';
  } else {
    document.getElementById('setupPassword').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
  }
}

async function setupAdminPassword() {
  const password = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  
  if (!password || password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  if (password !== confirm) {
    alert('Las contraseñas no coinciden');
    return;
  }
  
  const hash = hashPassword(password);
  await saveData('admin-password-hash', hash);
  alert('✅ Contraseña creada exitosamente');
  
  // Limpiar campos
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  
  checkPasswordSetup();
}

async function loginAdmin() {
  const password = document.getElementById('adminPassword').value;
  const hash = hashPassword(password);
  const storedHash = await loadData('admin-password-hash');
  
  if (hash === storedHash) {
    isAdmin = true;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminGalleryControls').style.display = 'block';
    document.getElementById('adminMaterialControls').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    
    // Recargar datos para mostrar controles de admin
    if (currentPage === 'galeria') loadGallery();
    if (currentPage === 'material') loadMaterials();
  } else {
    alert('❌ Contraseña incorrecta');
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminGalleryControls').style.display = 'none';
  document.getElementById('adminMaterialControls').style.display = 'none';
  closeAdminModal();
  
  // Recargar datos para ocultar controles de admin
  if (currentPage === 'galeria') loadGallery();
  if (currentPage === 'material') loadMaterials();
}

async function resetPassword() {
  if (confirm('¿Deseas cambiar tu contraseña de administrador?')) {
    await deleteData('admin-password-hash');
    logoutAdmin();
    alert('Contraseña eliminada. Crea una nueva la próxima vez que entres.');
  }
}

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
}

// Evento para agregar imágenes
document.getElementById('addImageInput').addEventListener('change', async (e) => {
  if (!isAdmin) return;
  
  const files = e.target.files;
  if (!files.length) return;

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
}

async function deleteMaterial(id) {
  if (!isAdmin || !confirm('¿Eliminar este material?')) return;
  
  const materials = await loadData('materials') || [];
  const filtered = materials.filter(m => m.id !== id);
  await saveData('materials', filtered);
  loadMaterials();
}

// ========================================
// MODALES
// ========================================
function openAdminModal() {
  document.getElementById('adminModal').classList.add('active');
  checkPasswordSetup();
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function openAddMaterialModal() {
  if (!isAdmin) return;
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
  const phoneNumber = '573000000000'; // CAMBIAR POR TU NÚMERO REAL
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
});
