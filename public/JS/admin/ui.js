const mensaje = document.getElementById("mensaje");

export function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.style.display = "block";

  setTimeout(() => {
    mensaje.style.display = "none";
  }, 2000);
}
