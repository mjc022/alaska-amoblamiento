import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

/* ===============================
   DOM
================================ */
const nombreInput = document.getElementById("nombre");
const categoriaSelect = document.getElementById("categoria");
const guardarBtn = document.getElementById("guardarBtn");
const lista = document.getElementById("lista");
const buscadorInput = document.getElementById("buscadorMuebles");

const chkCaj = document.getElementById("usa_cajones");
const chkPta = document.getElementById("usa_puertas");
const chkEst = document.getElementById("usa_estantes");
const chkProf = document.getElementById("usa_profundidad");
const chkActivo = document.getElementById("activo");

/* ===============================
   ESTADO
================================ */
let editandoId = null;
let mueblesCache = []; // cache de muebles cargados para filtrar

/* ===============================
   CARGAR CATEGORÍAS
================================ */
async function cargarCategorias() {
  const { data } = await supabase
    .from("categorias")
    .select("id, nombre")
    .order("nombre");

  categoriaSelect.innerHTML = "";

  data.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    categoriaSelect.appendChild(opt);
  });
}

/* ===============================
   CARGAR MUEBLES
================================ */
async function cargarMuebles() {
  const { data, error } = await supabase
    .from("muebles")
    .select(`
      id,
      nombre,
      activo,
      usa_cajones,
      usa_puertas,
      usa_estantes,
      usa_profundidad,
      categoria_id,
      categorias:categorias!muebles_categoria_id_fkey (nombre)
    `)
    .order("nombre");

  if (error) {
    console.error(error);
    alert("Error cargando muebles");
    return;
  }

  mueblesCache = data; // guardo en cache para filtrar
  mostrarMuebles(data);
}

/* ===============================
   MOSTRAR / FILTRAR MUEBLES
================================ */
function mostrarMuebles(muebles) {
  lista.innerHTML = "";

  muebles.forEach(m => {
    const div = document.createElement("div");
    div.className = "mueble-item";

    div.innerHTML = `
      <div>
        <strong>${m.nombre}</strong>
        <small>(${m.categorias?.nombre || "Sin categoría"})</small><br>
        <small>
          ${m.usa_cajones ? "Cajones · " : ""}
          ${m.usa_puertas ? "Puertas · " : ""}
          ${m.usa_estantes ? "Estantes · " : ""}
          ${m.usa_profundidad ? "Prof." : ""}
        </small>
      </div>

      <div class="acciones">
        <label>
          <input type="checkbox" ${m.activo ? "checked" : ""}>
          Activo
        </label>
        <button>✏️</button>
        <button>🗑️</button>
      </div>
    `;

    div.querySelector("input[type=checkbox]").onchange = e =>
      supabase.from("muebles")
        .update({ activo: e.target.checked })
        .eq("id", m.id);

    div.querySelector("button:nth-child(2)").onclick = () => editar(m);

    div.querySelector("button:nth-child(3)").onclick = async () => {
      if (!confirm(`Eliminar ${m.nombre}?`)) return;
      await supabase.from("muebles").delete().eq("id", m.id);
      cargarMuebles();
    };

    lista.appendChild(div);
  });
}

/* ===============================
   FILTRO EN TIEMPO REAL
================================ */
buscadorInput.addEventListener("input", () => {
  const texto = buscadorInput.value.toLowerCase();
  const filtrados = mueblesCache.filter(m => m.nombre.toLowerCase().includes(texto));
  mostrarMuebles(filtrados);
});

/* ===============================
   GUARDAR / EDITAR
================================ */
guardarBtn.onclick = async () => {
  if (!nombreInput.value) return alert("Nombre requerido");

  const data = {
    nombre: nombreInput.value,
    categoria_id: categoriaSelect.value,
    usa_cajones: chkCaj.checked,
    usa_puertas: chkPta.checked,
    usa_estantes: chkEst.checked,
    usa_profundidad: chkProf.checked,
    activo: chkActivo.checked
  };

  if (editandoId) {
    await supabase.from("muebles").update(data).eq("id", editandoId);
  } else {
    await supabase.from("muebles").insert(data);
  }

  resetForm();
  cargarMuebles();
};

function editar(m) {
  editandoId = m.id;
  nombreInput.value = m.nombre;
  categoriaSelect.value = m.categoria_id;
  chkCaj.checked = m.usa_cajones;
  chkPta.checked = m.usa_puertas;
  chkEst.checked = m.usa_estantes;
  chkProf.checked = m.usa_profundidad;
  chkActivo.checked = m.activo;
}

function resetForm() {
  editandoId = null;
  nombreInput.value = "";
  chkCaj.checked = false;
  chkPta.checked = false;
  chkEst.checked = false;
  chkProf.checked = true;
  chkActivo.checked = true;
}

/* ===============================
   INIT
================================ */
await cargarCategorias();
await cargarMuebles();
/*================================ */
/* ===============================
   CATEGORÍAS*/
