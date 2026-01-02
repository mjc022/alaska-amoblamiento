// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const SUPABASE_URL = "https://jaubtlunajybgihikjrw.supabase.co";
const SUPABASE_KEY = "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z";

// ===============================
// ELEMENTOS DEL DOM
// ===============================
const categoriaSelect = document.getElementById("categoria");
const materialSelect  = document.getElementById("material");
const extrasDiv       = document.getElementById("extras");
const totalDiv        = document.getElementById("total");
const calcularBtn     = document.getElementById("calcularBtn");

// ===============================
// CARGAR CATEGORÍAS
// ===============================
fetch(`${SUPABASE_URL}/rest/v1/categorias?select=*`, {
  headers: { apikey: SUPABASE_KEY }
})
.then(res => res.json())
.then(data => {
  categoriaSelect.innerHTML = "";

  data.forEach(cat => {
    categoriaSelect.innerHTML += `
      <option value="${cat.id}">
        ${cat.nombre}
      </option>`;
  });

  cargarMateriales();
  cargarExtras();
});

// ===============================
// CARGAR MATERIALES
// (por ahora sin filtrar categoría)
// ===============================
function cargarMateriales() {
  fetch(`${SUPABASE_URL}/rest/v1/materiales?select=*`, {
    headers: { apikey: SUPABASE_KEY }
  })
  .then(res => res.json())
  .then(data => {
    materialSelect.innerHTML = "";

    data.forEach(mat => {
      materialSelect.innerHTML += `
        <option value="${mat.precio_m2}">
          ${mat.nombre}
        </option>`;
    });
  });
}

categoriaSelect.addEventListener("change", cargarMateriales);

// ===============================
// CARGAR EXTRAS
// ===============================
function cargarExtras() {
  fetch(`${SUPABASE_URL}/rest/v1/extras?select=*`, {
    headers: { apikey: SUPABASE_KEY }
  })
  .then(res => res.json())
  .then(data => {
    extrasDiv.innerHTML = "";

    data.forEach(extra => {
      extrasDiv.innerHTML += `
        <label>
          <input type="checkbox"
            data-tipo="${extra.tipo_precio}"
            data-valor="${extra.valor}">
          ${extra.nombre}
        </label><br>`;
    });
  });
}

// ===============================
// CALCULAR PRESUPUESTO
// ===============================
function calcular() {
  const ancho = Number(document.getElementById("ancho").value);
  const alto  = Number(document.getElementById("alto").value);
  const precioM2 = Number(materialSelect.value);

  if (!ancho || !alto) {
    alert("Completá las medidas");
    return;
  }

  const m2 = (ancho * alto) / 10000;
  let total = m2 * precioM2;

  extrasDiv.querySelectorAll("input:checked").forEach(extra => {
    const tipo  = extra.dataset.tipo;
    const valor = Number(extra.dataset.valor);

    if (tipo === "fijo") {
      total += valor;
    }

    if (tipo === "porcentaje") {
      total += total * (valor / 100);
    }
  });

  totalDiv.innerText = "$ " + Math.round(total).toLocaleString("es-AR");
}

calcularBtn.addEventListener("click", calcular);

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

const lista = document.getElementById("listaMateriales");

console.log("Admin JS cargado");

async function cargarMateriales() {
  console.log("Cargando materiales...");

  const { data, error } = await supabase
    .from("materiales")
    .select("*");

  console.log("Resultado:", data);
  console.log("Error:", error);

  if (error) {
    alert("Error cargando materiales");
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>No hay materiales cargados</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(m => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${m.nombre}</strong>
      <input type="number" value="${m.precio}">
    `;

    div.querySelector("input").addEventListener("change", e => {
      actualizar(m.id, e.target.value);
    });

    lista.appendChild(div);
  });
}

async function actualizar(id, precio) {
  const { error } = await supabase
    .from("materiales")
    .update({ precio: Number(precio) })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al actualizar");
  }
}

cargarMateriales();

