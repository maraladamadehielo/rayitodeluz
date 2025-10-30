// ===============================
// Rayito de Luz ✨
// script.js
// ===============================

// Año automático en el pie de página
document.getElementById("year").textContent = new Date().getFullYear();

// ===============================
// GALERÍA - Guardar imágenes en localStorage
// ===============================
const gallery = document.getElementById("gallery");
const addImageInput = document.getElementById("addImageInput");

// Cargar imágenes guardadas
window.addEventListener("DOMContentLoaded", () => {
  const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
  savedImages.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    gallery.appendChild(img);
  });
});

// Agregar nuevas imágenes
addImageInput.addEventListener("change", e => {
  const files = e.target.files;
  if (!files.length) return;

  const readerPromises = [...files].map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readerPromises).then(images => {
    const savedImages = JSON.parse(localStorage.getItem("galleryImages")) || [];
    const updated = [...savedImages, ...images];
    localStorage.setItem("galleryImages", JSON.stringify(updated));

    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      gallery.appendChild(img);
    });

    addImageInput.value = ""; // limpiar input
  });
});

// ===============================
// FUNCIONES DE CONTACTO
// ===============================
function sendWhatsApp() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const texto = `Hola, soy ${name || "un interesado"} 👋%0A%0A${message}`;
  const url = `https://wa.me/573000000000?text=${texto}`;
  window.open(url, "_blank");
}

function sendEmail() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = `Consulta de ${name || "interesado"} - Rayito de Luz`;
  const body = `${message}`;
  const mailto = `mailto:rayitodeluz@correo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}