import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

/* ===============================
   DOM
================================ */
const categoriaSelect = document.getElementById("categoria");
const muebleSelect = document.getElementById("mueble");
const materialSelect = document.getElementById("material");
const resultadoDiv = document.getElementById("resultado");
const resumenPrint = document.getElementById("resumenPrint");

const coleccionSelect = document.getElementById("coleccionTerminacion");
const grid = document.getElementById("terminacionesGrid");

/* ===============================
   ESTADO
================================ */
let muebleActual = null;
let terminacionSeleccionada = null;

/* ===============================
   UTILS
================================ */
const num = v => Number(v || 0);
const cm2ToM2 = v => v / 10000;

/* ===============================
   TOGGLE CAMPOS
================================ */
function toggle(id, visible) {
  const input = document.getElementById(id);
  if (!input) return;

  const label = input.previousElementSibling;
  if (label) label.style.display = visible ? "block" : "none";

  input.style.display = visible ? "block" : "none";

  if (!visible) input.value = 0;
}

/* ===============================
   CARGAS
================================ */
async function cargarCategorias() {
  const { data } = await supabase.from("categorias").select("*").eq("activo", true);
  categoriaSelect.innerHTML = "";
  data.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = c.nombre;
    categoriaSelect.appendChild(o);
  });
  cargarMuebles(data[0].id);
}

async function cargarMuebles(cat) {
  const { data } = await supabase
    .from("muebles")
    .select("*")
    .eq("categoria_id", cat)
    .eq("activo", true);

  muebleSelect.innerHTML = "";
  data.forEach(m => {
    const o = document.createElement("option");
    o.textContent = m.nombre;
    o.dataset.mueble = JSON.stringify(m);
    muebleSelect.appendChild(o);
  });

  setMueble(JSON.parse(muebleSelect.selectedOptions[0].dataset.mueble));
}

function setMueble(m) {
  muebleActual = m;
  toggle("profundidad", m.usa_profundidad);
  toggle("cajones", m.usa_cajones);
  toggle("puertas", m.usa_puertas);
  toggle("estantes", m.usa_estantes);
}
/* ===============================
   MATERIALES
================================ */
async function cargarMateriales() {
  const { data, error } = await supabase
    .from("materiales")
    .select("id, nombre, precio")
    .eq("activo", true)
    .eq("tipo", "estructura")
    .order("nombre");

  if (error) {
    console.error("Error cargando materiales", error);
    return;
  }

  materialSelect.innerHTML = "";

  data.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.nombre;
    opt.dataset.precio = m.precio; // 🔴 ESTO ES CLAVE
    materialSelect.appendChild(opt);
  });
}
 
/* ===============================
   TERMINACIONES
================================ */
async function cargarTerminaciones(col) {
  const { data } = await supabase
    .from("terminaciones")
    .select("*")
    .eq("activo", true)
    .eq("coleccion", col)
    .order("orden");

  grid.innerHTML = "";
  terminacionSeleccionada = null;

  data.forEach(t => {
    const d = document.createElement("div");
    d.className = "terminacion-item";
    d.innerHTML = `<img src="${t.imagen_url}"><small>${t.nombre}</small>`;
    d.onclick = () => {
      document.querySelectorAll(".terminacion-item").forEach(x => x.classList.remove("active"));
      d.classList.add("active");
      terminacionSeleccionada = t;
    };
    grid.appendChild(d);
  });
}

/* ===============================
   CALCULAR
================================ */
async function calcular() {
  if (!terminacionSeleccionada) return alert("Elegí una terminación");

  const ancho = Number(document.getElementById("ancho").value || 0);
  const alto  = Number(document.getElementById("alto").value || 0);
  const prof  = muebleActual.usa_profundidad
  ? Number(document.getElementById("profundidad").value || 0)
  : 0;

  const caj = muebleActual.usa_cajones ? Number(document.getElementById("cajones").value || 0) : 0;
  const pta = muebleActual.usa_puertas ? Number(document.getElementById("puertas").value || 0) : 0;
  const est = muebleActual.usa_estantes ? Number(document.getElementById("estantes").value || 0) : 0;
  resultadoDiv.dataset.ancho = ancho;
  resultadoDiv.dataset.alto = alto;
  resultadoDiv.dataset.profundidad = prof;
  resultadoDiv.dataset.cajones = caj;
  resultadoDiv.dataset.puertas = pta;
  resultadoDiv.dataset.estantes = est;

  const precio = num(materialSelect.selectedOptions[0].dataset.precio);

  const m2 = cm2ToM2(
    (alto * prof) * 2 +
    (ancho * prof) * 2 +
    (ancho * alto)
  );

  const total = m2 * precio;
  resultadoDiv.innerText = "$ " + Math.round(total).toLocaleString("es-AR");
  resultadoDiv.dataset.total = resultadoDiv.innerText;

  generarResumen();
}

/* ===============================
   RESUMEN PRINT
================================ */
function generarResumen() {
  resumenPrint.innerHTML = `
    <h2>Presupuesto</h2>

    <p><strong>Mueble:</strong> ${muebleSelect.value}</p>
    <p><strong>Ancho:</strong> ${resultadoDiv.dataset.ancho} cm</p>
    <p><strong>Alto:</strong> ${resultadoDiv.dataset.alto} cm</p>

    ${muebleActual.usa_profundidad
      ? `<p><strong>Profundidad:</strong> ${resultadoDiv.dataset.profundidad} cm</p>`
      : ""}

    ${resultadoDiv.dataset.puertas > 0
      ? `<p><strong>Puertas:</strong> ${resultadoDiv.dataset.puertas}</p>`
      : ""}

    ${resultadoDiv.dataset.cajones > 0
      ? `<p><strong>Cajones:</strong> ${resultadoDiv.dataset.cajones}</p>`
      : ""}

    ${resultadoDiv.dataset.estantes > 0
      ? `<p><strong>Estantes:</strong> ${resultadoDiv.dataset.estantes}</p>`
      : ""}

    <p><strong>Terminación:</strong> ${terminacionSeleccionada.nombre}</p>

    <img
      src="${terminacionSeleccionada.imagen_url}"
      class="terminacion-preview"
      alt="Terminación seleccionada"
    >

    <h3>Total: ${resultadoDiv.dataset.total}</h3>
  `;
}

/* ===============================
   EVENTOS
================================ */
categoriaSelect.onchange = () => cargarMuebles(categoriaSelect.value);
muebleSelect.onchange = e => setMueble(JSON.parse(e.target.selectedOptions[0].dataset.mueble));
coleccionSelect.onchange = e => e.target.value && cargarTerminaciones(e.target.value);
calcularBtn.onclick = calcular;

/* ===============================
   INIT
================================ */
await cargarCategorias();
await cargarMateriales();
await cargarTerminaciones(coleccionSelect.value);