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

const coleccionEstructuraSelect = document.getElementById("coleccionEstructura");
const coleccionFrenteSelect = document.getElementById("coleccionFrente");
const gridEstructura = document.getElementById("gridEstructura");
const gridFrente = document.getElementById("gridFrente");

const calcularBtn = document.getElementById("calcularBtn");
const resultadoDiv = document.getElementById("resultado");
const resumenPrint = document.getElementById("resumenPrint");

/* ===============================
   ESTADO
================================ */
let muebleActual = null;
let terminacionEstructura = null;
let terminacionFrente = null;

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
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error("Error cargarCategorias:", error);
    alert("Error cargando categorías");
    return;
  }

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
  const { data, error } = await supabase
    .from("muebles")
    .select("*")
    .eq("categoria_id", catId)
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error("Error cargarMuebles:", error);
    alert("Error cargando muebles");
    return;
  }

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
  const { data, error } = await supabase
    .from("materiales")
    .select("id, nombre, precio")
    .eq("activo", true)
    .eq("tipo", "estructura")
    .order("nombre");

  if (error) {
    console.error("Error cargarMateriales:", error);
    alert("Error cargando materiales");
    return;
  }

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
async function cargarTerminaciones(col, gridDestino, onSelect) {
  const { data, error } = await supabase
    .from("terminaciones")
    .select("*")
    .eq("activo", true)
    .eq("coleccion", col)
    .order("orden");

  if (error) {
    console.error("Error cargarTerminaciones:", error);
    alert("Error cargando terminaciones");
    return;
  }

  gridDestino.innerHTML = "";

  data.forEach(t => {
    const d = document.createElement("div");
    d.className = "terminacion-item";
    d.innerHTML = `<img src="${t.imagen_url}"><small>${t.nombre}</small>`;

    d.onclick = () => {
      gridDestino
        .querySelectorAll(".terminacion-item")
        .forEach(x => x.classList.remove("active"));

      d.classList.add("active");
      onSelect(t);
    };

    gridDestino.appendChild(d);
  });
}

/* ===============================
   AUX DB
================================ */
async function obtenerMaterialPisoCajon() {
  const { data, error } = await supabase
    .from("materiales")
    .select("precio")
    .eq("tipo", "piso_cajon")
    .eq("activo", true)
    .single();

  if (error) {
    console.error("Error obtenerMaterialPisoCajon:", error);
    return 0;
  }

  return data ? Number(data.precio) : 0;
}

async function obtenerMargen() {
  const { data, error } = await supabase
    .from("configuracion")
    .select("margen")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error obtenerMargen:", error);
    return 0;
  }

  return data ? Number(data.margen) : 0;
}

/* ===============================
   HERRAJES (UNIDAD / M2)
================================ */
async function calcularHerrajes(tipo, cantidad, m2 = 0) {
  if ((cantidad || 0) <= 0 && (m2 || 0) <= 0) return 0;

  const { data, error } = await supabase
    .from("reglas_herrajes")
    .select("cantidad_por_unidad, unidad, materiales(precio)")
    .eq("aplica_a", tipo)
    .eq("activo", true);

  if (error) {
    console.error(`Error calcularHerrajes(${tipo}):`, error);
    return 0;
  }

  if (!data?.length) return 0;

  const detalle = data.map(r => {
    const precio = Number(r.materiales?.precio || 0);
    const factor = Number(r.cantidad_por_unidad || 0);
    const base = r.unidad === "m2" ? Number(m2 || 0) : Number(cantidad || 0);
    const total = factor * base * precio;

    return {
      unidad: r.unidad || "unidad",
      cantidad_por_unidad: factor,
      base_usada: base,
      precio_unitario: precio,
      total
    };
  });

  const totalHerrajes = detalle.reduce((acc, x) => acc + x.total, 0);

  console.log(`=== HERRAJES: ${tipo.toUpperCase()} ===`);
  console.table(detalle);
  console.log(`Total herrajes ${tipo}:`, totalHerrajes);

  return totalHerrajes;
}

/* ===============================
   CALCULO
================================ */
async function calcular() {
  console.clear();
  console.log("=== CALCULO ===");

  if (!muebleActual) return alert("No hay mueble");
  if (!terminacionEstructura) return alert("Elegí color de estructura");
  if (!terminacionFrente) return alert("Elegí color de frente");

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

  const precioM2 = num(materialSelect.selectedOptions[0].dataset.precio);

  console.log("=== ENTRADAS ===");
  console.log({
    mueble: muebleActual?.nombre,
    ancho_cm: ancho,
    alto_cm: alto,
    profundidad_cm: prof,
    cajones: caj,
    puertas: pta,
    estantes: est,
    material_precio_m2: precioM2,
    estructura: terminacionEstructura?.nombre,
    frente: terminacionFrente?.nombre
  });

  /* M2 */
  const m2Estructura = cm2ToM2(
    (alto * prof) * 2 +
    (ancho * prof) * 2 +
    (ancho * alto)
  );

  const m2Estantes = est ? cm2ToM2(ancho * prof) * est : 0;
  const m2Puertas = pta ? cm2ToM2(ancho * alto) : 0;

  // m2 TOTAL de cajones (piso del cajón: ancho x profundidad)
  const m2Cajones = caj && prof ? cm2ToM2(ancho * prof) * caj : 0;

  const m2Total = m2Estructura + m2Estantes + m2Puertas;

  console.log("=== M2 CALCULADOS ===");
  console.log({
    m2Estructura,
    m2Estantes,
    m2Puertas,
    m2Cajones,
    m2Total
  });

  /* COSTOS */
  const costoMelamina = m2Total * precioM2;
  const costoCajones = caj * await obtenerMaterialPisoCajon();

  console.log("=== COSTOS BASE ===");
  console.log({
    costoMelamina,
    costoCajones
  });

  /* HERRAJES */
  const herrajes =
    await calcularHerrajes("cajon", caj, m2Cajones) +
    await calcularHerrajes("puerta", pta) +
    await calcularHerrajes("estante", est);

  console.log("=== HERRAJES TOTAL ===");
  console.log({ herrajes });

  const subtotal = costoMelamina + costoCajones + herrajes;
  const margen = await obtenerMargen();
  const totalFinal = subtotal * (1 + margen / 100);

  console.log("=== TOTALES ===");
  console.log({
    subtotal,
    margen_percent: margen,
    totalFinal
  });

  const totalTxt = "$ " + Math.round(totalFinal).toLocaleString("es-AR");
  resultadoDiv.innerText = totalTxt;

  /* IMPRESIÓN / PDF (CON MEDIDAS Y CANTIDADES) */
  resumenPrint.innerHTML = `
    <h2>Presupuesto</h2>

    <p><strong>Mueble:</strong> ${muebleActual.nombre}</p>

    <h3>Medidas</h3>
    <p><strong>Ancho:</strong> ${ancho} cm</p>
    <p><strong>Alto:</strong> ${alto} cm</p>
    ${prof ? `<p><strong>Profundidad:</strong> ${prof} cm</p>` : ""}

    <h3>Componentes</h3>
    ${caj ? `<p><strong>Cajones:</strong> ${caj}</p>` : `<p><strong>Cajones:</strong> 0</p>`}
    ${pta ? `<p><strong>Puertas:</strong> ${pta}</p>` : `<p><strong>Puertas:</strong> 0</p>`}
    ${est ? `<p><strong>Estantes:</strong> ${est}</p>` : `<p><strong>Estantes:</strong> 0</p>`}

    <h3>Colores</h3>
    <p><strong>Estructura:</strong> ${terminacionEstructura.nombre}</p>
    <img src="${terminacionEstructura.imagen_url}" style="max-width:200px">

    <p><strong>Frente:</strong> ${terminacionFrente.nombre}</p>
    <img src="${terminacionFrente.imagen_url}" style="max-width:200px">

    <h3>Total: ${totalTxt}</h3>
  `;
}

/* ===============================
   EVENTOS
================================ */
categoriaSelect.onchange = () => cargarMuebles(categoriaSelect.value);
muebleSelect.onchange = e => setMueble(JSON.parse(e.target.selectedOptions[0].dataset.mueble));

coleccionEstructuraSelect.onchange = e => {
  terminacionEstructura = null;
  if (e.target.value)
    cargarTerminaciones(e.target.value, gridEstructura, t => (terminacionEstructura = t));
};

coleccionFrenteSelect.onchange = e => {
  terminacionFrente = null;
  if (e.target.value)
    cargarTerminaciones(e.target.value, gridFrente, t => (terminacionFrente = t));
};

calcularBtn.onclick = calcular;

/* ===============================
   INIT
================================ */
await cargarCategorias();
await cargarMateriales();
