import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

/* ===============================
   DOM
================================ */
const nombreInput = document.getElementById("nombre");
const guardarBtn = document.getElementById("guardarBtn");
const lista = document.getElementById("lista");

/* ===============================
   ESTADO
================================ */
let editandoId = null;

/* ===============================
   CARGAR CATEGORÍAS
================================ */
async function cargarCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");

  if (error) {
    console.error("Error cargando categorías:", error);
    return;
  }

  lista.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <strong>${c.nombre}</strong>
      <div>
        <label>
          <input type="checkbox" ${c.activo ? "checked" : ""}>
          Activo
        </label>
        <button>✏️</button>
        <button>🗑️</button>
      </div>
    `;

    /* Toggle activo */
    div.querySelector("input").onchange = async e => {
  const { error } = await supabase
    .from("categorias")
    .update({ activo: e.target.checked })
    .eq("id", c.id);

  if (error) {
    alert("No se pudo actualizar el estado de la categoría");
    console.error(error);
    e.target.checked = !e.target.checked;
  }
};


    /* Editar */
    div.querySelector("button:nth-child(2)").onclick = () => editar(c);

    /* Eliminar */
    div.querySelector("button:nth-child(3)").onclick = async () => {
      if (!confirm(`Eliminar "${c.nombre}"?`)) return;

      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", c.id);

      if (error) {
        if (error.code === "23503") {
          alert("No se puede eliminar la categoría porque tiene muebles asociados.");
        } else {
          alert("Error al eliminar la categoría.");
          console.error(error);
        }
        return;
      }

      cargarCategorias();
    };

    lista.appendChild(div);
  });
}

/* ===============================
   GUARDAR
================================ */
guardarBtn.onclick = async () => {
  if (!nombreInput.value) {
    alert("Nombre requerido");
    return;
  }

  if (editandoId) {
    await supabase
      .from("categorias")
      .update({ nombre: nombreInput.value })
      .eq("id", editandoId);
  } else {
    await supabase
      .from("categorias")
      .insert({ nombre: nombreInput.value, activo: true });
  }

  resetForm();
  cargarCategorias();
};

/* ===============================
   HELPERS
================================ */
function editar(c) {
  editandoId = c.id;
  nombreInput.value = c.nombre;
}

function resetForm() {
  editandoId = null;
  nombreInput.value = "";
}

/* ===============================
   INIT
================================ */
cargarCategorias();
