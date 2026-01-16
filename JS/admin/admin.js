import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===============================
   SUPABASE
================================ */
const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

/* ===============================
   AUTH
================================ */
const { data: { user } } = await supabase.auth.getUser();
if (!user) location.href = "../view/login.html";

/* ===============================
   DOM
================================ */
const container = document.getElementById("materialesContainer");
const mensaje = document.getElementById("mensaje");
/* ===============================
   LOGOUT (solo si existe)
================================ */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.href = "../view/login.html";
  });
}


const matNombre = document.getElementById("matNombre");
const matPrecio = document.getElementById("matPrecio");
const matUnidad = document.getElementById("matUnidad");
const matTipo = document.getElementById("matTipo");
const agregarMaterialBtn = document.getElementById("agregarMaterialBtn");
const buscador = document.getElementById("buscadorMateriales");

/* ===============================
   UI
================================ */
function mostrarMensaje(txt) {
  mensaje.innerText = txt;
  mensaje.style.display = "block";
  setTimeout(() => (mensaje.style.display = "none"), 2000);
}

/* ===============================
   CARGAR MATERIALES
================================ */
async function cargarMateriales() {
  const { data, error } = await supabase
    .from("materiales")
    .select("*")
    .order("nombre");

  if (error) {
    console.error(error);
    return;
  }

  renderMateriales(data);
}

/* ===============================
   RENDER
================================ */
function renderMateriales(materiales) {
  container.innerHTML = "";

  const grupos = {};
  materiales.forEach(m => {
    if (!grupos[m.tipo]) grupos[m.tipo] = [];
    grupos[m.tipo].push(m);
  });

  Object.entries(grupos).forEach(([tipo, items]) => {
    const grupo = document.createElement("div");
    grupo.className = "material-grupo";

    grupo.innerHTML = `
      <div class="material-header">
        ${tipo.replace("_", " ").toUpperCase()}
        <span>${items.length}</span>
      </div>
      <div class="material-lista"></div>
    `;

    const lista = grupo.querySelector(".material-lista");

    items.forEach(m => {
      const item = document.createElement("div");
      item.className = "material-item";

      item.innerHTML = `
        <div class="info">
          <strong>${m.nombre}</strong><br>
          <small>${m.unidad} · ${m.tipo}</small>
        </div>

        <div class="acciones">
          $ <input type="number" value="${m.precio}">

          <label>
            <input type="checkbox" ${m.activo ? "checked" : ""}>
            Activo
          </label>

          <button class="btn-edit">✏️</button>
          <button class="btn-delete">🗑️</button>
        </div>
      `;

      item.querySelector('input[type="number"]').onchange = e =>
        actualizarPrecio(m.id, e.target.value);

      item.querySelector('input[type="checkbox"]').onchange = e =>
        toggleActivo(m.id, e.target.checked);

      item.querySelector(".btn-edit").onclick = async () => {
        const nombre = prompt("Nombre:", m.nombre);
        if (nombre === null) return;

        const unidad = prompt("Unidad (m2 / unidad):", m.unidad);
        if (unidad === null) return;

        const tipoNuevo = prompt(
          "Tipo (estructura / piso_cajon / herrajes):",
          m.tipo
        );
        if (tipoNuevo === null) return;

        const { error } = await supabase
          .from("materiales")
          .update({ nombre, unidad, tipo: tipoNuevo })
          .eq("id", m.id);

        if (!error) {
          mostrarMensaje("Material actualizado");
          cargarMateriales();
        }
      };

      item.querySelector(".btn-delete").onclick = async () => {
        if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;

        await supabase.from("materiales").delete().eq("id", m.id);
        mostrarMensaje("Material eliminado");
        cargarMateriales();
      };

      lista.appendChild(item);
    });

    grupo.querySelector(".material-header").onclick = () => {
      lista.style.display = lista.style.display === "block" ? "none" : "block";
    };

    container.appendChild(grupo);
  });
}

/* ===============================
   UPDATE
================================ */
async function actualizarPrecio(id, precio) {
  await supabase.from("materiales").update({ precio }).eq("id", id);
  mostrarMensaje("Precio actualizado");
}

async function toggleActivo(id, activo) {
  await supabase.from("materiales").update({ activo }).eq("id", id);
  mostrarMensaje("Estado actualizado");
}

/* ===============================
   AGREGAR
================================ */
agregarMaterialBtn.onclick = async () => {
  if (!matNombre.value || !matPrecio.value) return;

  await supabase.from("materiales").insert({
    nombre: matNombre.value,
    precio: Number(matPrecio.value),
    unidad: matUnidad.value,
    tipo: matTipo.value,
    activo: true
  });

  matNombre.value = "";
  matPrecio.value = "";

  mostrarMensaje("Material agregado");
  cargarMateriales();
};

/* ===============================
   BUSCADOR
================================ */
buscador.oninput = e => {
  const texto = e.target.value.toLowerCase();
  document.querySelectorAll(".material-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(texto)
      ? "flex"
      : "none";
  });
};

/* ===============================
   INIT
================================ */
cargarMateriales();
