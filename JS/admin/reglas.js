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
const aplicaASelect = document.getElementById("aplicaA");
const herrajeSelect = document.getElementById("herrajeSelect");
const cantidadInput = document.getElementById("cantidadInput");
const agregarBtn = document.getElementById("agregarReglaBtn");
const listaReglas = document.getElementById("listaReglas");

/* ===============================
   CARGAR HERRAJES
================================ */
async function cargarHerrajes() {
  const { data, error } = await supabase
    .from("materiales")
    .select("id, nombre")
    .eq("tipo", "herrajes")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error(error);
    return;
  }

  const select = document.getElementById("herrajeSelect");
  select.innerHTML = "";

  data.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h.id;
    opt.textContent = h.nombre;
    select.appendChild(opt);
  });
}


/* ===============================
   CARGAR REGLAS
================================ */
async function cargarReglas() {
  const { data, error } = await supabase
    .from("reglas_herrajes")
    .select(`
      id,
      aplica_a,
      cantidad_por_unidad,
      materiales ( nombre )
    `)
    .order("aplica_a");

  if (error) {
    console.error(error);
    return;
  }

  listaReglas.innerHTML = "";

  data.forEach(r => {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";

    div.innerHTML = `
      <strong>${r.materiales.nombre}</strong>
      → ${r.aplica_a}
      (${r.cantidad_por_unidad})
      <button data-id="${r.id}">🗑</button>
    `;

    div.querySelector("button").onclick = () => borrarRegla(r.id);
    listaReglas.appendChild(div);
  });
}

/* ===============================
   AGREGAR REGLA
================================ */
agregarBtn.addEventListener("click", async () => {
  const aplica_a = aplicaASelect.value;
  const herraje_id = herrajeSelect.value;
  const cantidad_por_unidad = Number(cantidadInput.value);

  if (!herraje_id || cantidad_por_unidad <= 0) {
    alert("Completá todos los campos");
    return;
  }

  const { error } = await supabase
    .from("reglas_herrajes")
    .insert({
      aplica_a,
      herraje_id,
      cantidad_por_unidad,
      activo: true
    });

  if (error) {
    console.error(error);
    alert("Error al guardar regla");
    return;
  }

  cantidadInput.value = "";
  cargarReglas();
});




/* ===============================
   BORRAR REGLA
================================ */
async function borrarRegla(id) {
  if (!confirm("Eliminar regla?")) return;

  await supabase
    .from("reglas_herrajes")
    .delete()
    .eq("id", id);

  cargarReglas();
}

/* ===============================
   INIT
================================ */
cargarHerrajes();
cargarReglas();
