const mensaje = document.getElementById("mensaje");


import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jaubtlunajybgihikjrw.supabase.co";
const SUPABASE_KEY = "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function mostrarMensaje(texto) {
  mensaje.innerText = texto;
  mensaje.style.display = "block";

  setTimeout(() => {
    mensaje.style.display = "none";
  }, 2000);
}


// ESPERAR SESIÓN CORRECTAMENTE
supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = "login.html";
  } else {
    cargarMateriales();
  }
});

// ELEMENTOS
const lista = document.getElementById("listaMateriales");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});

// CARGAR MATERIALES
async function cargarMateriales() {
  const { data, error } = await supabase
    .from("materiales")
    .select("*");

  if (error) {
    alert("Error cargando materiales");
    return;
  }

  lista.innerHTML = "";

  data.forEach(m => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${m.nombre}
      <input type="number" value="${m.precio}">
    `;

    div.querySelector("input").addEventListener("change", e => {
      actualizar(m.id, e.target.value);
    });

    lista.appendChild(div);
  });
}

async function actualizar(id, precio) {
  const valor = Number(precio);
  if (isNaN(valor)) return;

  const { error } = await supabase
    .from("materiales")
    .update({ precio: valor })
    .eq("id", id);

  if (error) {
    alert("Error al actualizar");
    console.error(error);
    return;
  }

  mostrarMensaje("Precio actualizado");
}

// FIN DEL CÓDIGO