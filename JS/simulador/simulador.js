import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ===============================
   SUPABASE
================================ */
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
const coleccionSelect = document.getElementById("coleccionTerminacion");
const grid = document.getElementById("terminacionesGrid");
const calcularBtn = document.getElementById("calcularBtn");
const resultadoDiv = document.getElementById("resultado");
const resumenPrint = document.getElementById("resumenPrint");

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
  const label = input?.previousElementSibling;
  if (!input || !label) return;

  input.style.display = visible ? "block" : "none";
  label.style.display = visible ? "block" : "none";
  if (!visible) input.value = 0;
}

/* ===============================
   CARGAS
================================ */
async function cargarCategorias() {
  const { data } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  categoriaSelect.innerHTML = "";
  data.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = c.nombre;
    categoriaSelect.appendChild(o);
  });

  if (data.length) cargarMuebles(data[0].id);
}

async function cargarMuebles(catId) {
  const { data } = await supabase
    .from("muebles")
    .select("*")
    .eq("categoria_id", catId)
    .eq("activo", true)
    .order("nombre");

  muebleSelect.innerHTML = "";
  data.forEach(m => {
    const o = document.createElement("option");
    o.textContent = m.nombre;
    o.dataset.mueble = JSON.stringify(m);
    muebleSelect.appendChild(o);
  });

  if (data.length) setMueble(JSON.parse(muebleSelect.selectedOptions[0].dataset.mueble));
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
  const { data } = await supabase
    .from("materiales")
    .select("id, nombre, precio")
    .eq("activo", true)
    .eq("tipo", "estructura")
    .order("nombre");

  materialSelect.innerHTML = "";
  data.forEach(m => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.nombre;
    o.dataset.precio = m.precio;
    materialSelect.appendChild(o);
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
   AUX DB
================================ */
async function obtenerMaterialPisoCajon() {
  const { data } = await supabase
    .from("materiales")
    .select("precio")
    .eq("tipo", "piso_cajon")
    .eq("activo", true)
    .single();
  return data ? Number(data.precio) : 0;
}

async function obtenerMargen() {
  const { data } = await supabase
    .from("configuracion")
    .select("margen")
    .eq("id", 1)
    .single();
  return data ? Number(data.margen) : 0;
}

async function calcularHerrajes(tipo, cantidad) {
  if (cantidad <= 0) return 0;

  const { data } = await supabase
    .from("reglas_herrajes")
    .select("cantidad_por_unidad, materiales(precio)")
    .eq("aplica_a", tipo)
    .eq("activo", true);

  return data.reduce(
    (acc, r) => acc + r.cantidad_por_unidad * cantidad * r.materiales.precio,
    0
  );
}

/* ===============================
   CALCULO (CORREGIDO)
================================ */
async function calcular() {
  console.clear();
  console.log("=== CALCULO ===");

  if (!muebleActual) return alert("No hay mueble");
  if (!terminacionSeleccionada) return alert("Elegí una terminación");

  const ancho = num(document.getElementById("ancho").value);
  const alto = num(document.getElementById("alto").value);
  const prof = muebleActual.usa_profundidad
    ? num(document.getElementById("profundidad").value)
    : 0;

  const caj = muebleActual.usa_cajones
    ? num(document.getElementById("cajones").value)
    : 0;

  const pta = muebleActual.usa_puertas
    ? num(document.getElementById("puertas").value)
    : 0;

  const est = muebleActual.usa_estantes
    ? num(document.getElementById("estantes").value)
    : 0;


  console.log({ ancho, alto, prof, caj, pta, est });

  const precioM2 = num(materialSelect.selectedOptions[0].dataset.precio);

  /* ESTRUCTURA */
  const m2Estructura = cm2ToM2(
    (alto * prof) * 2 +
    (ancho * prof) * 2 +
    (ancho * alto)
  );

  /* ESTANTES */
  const m2Estantes = est > 0 ? cm2ToM2(ancho * prof) * est : 0;

  /* PUERTAS (NO MULTIPLICAN ALTURA) */
  const m2Puertas = pta > 0 ? cm2ToM2(ancho * alto) : 0;

  const m2Total = m2Estructura + m2Estantes + m2Puertas;

  console.log("m2 estructura:", m2Estructura);
  console.log("m2 estantes:", m2Estantes);
  console.log("m2 puertas:", m2Puertas);
  console.log("m2 TOTAL:", m2Total);

  const costoMelamina = m2Total * precioM2;
  const costoCajones = caj * await obtenerMaterialPisoCajon();

  const herrajes =
    await calcularHerrajes("cajon", caj) +
    await calcularHerrajes("puerta", pta) +
    await calcularHerrajes("estante", est);

  const subtotal = costoMelamina + costoCajones + herrajes;
  const margen = await obtenerMargen();
  const totalFinal = subtotal * (1 + margen / 100);

  console.log("subtotal:", subtotal);
  console.log("margen:", margen);
  console.log("TOTAL:", totalFinal);

  const totalTxt = "$ " + Math.round(totalFinal).toLocaleString("es-AR");
  resultadoDiv.innerText = totalTxt;

  /* IMPRESIÓN / PDF */
  resumenPrint.innerHTML = `
    <h2>Presupuesto</h2>
    <p><strong>Mueble:</strong> ${muebleActual.nombre}</p>
    <p><strong>Ancho:</strong> ${ancho} cm</p>
    <p><strong>Alto:</strong> ${alto} cm</p>
    ${prof ? `<p><strong>Profundidad:</strong> ${prof} cm</p>` : ""}
    ${caj ? `<p><strong>Cajones:</strong> ${caj}</p>` : ""}
    ${pta ? `<p><strong>Puertas:</strong> ${pta}</p>` : ""}
    ${est ? `<p><strong>Estantes:</strong> ${est}</p>` : ""}
    <p><strong>Terminación:</strong> ${terminacionSeleccionada.nombre}</p>
    <img src="${terminacionSeleccionada.imagen_url}" style="max-width:200px">
    <h3>Total: ${totalTxt}</h3>
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
