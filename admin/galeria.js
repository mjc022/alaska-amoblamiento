import "./guard.js";
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
const tituloInput = document.getElementById("titulo");
const descInput = document.getElementById("descripcion");
const categoriaSelect = document.getElementById("categoria");
const archivosInput = document.getElementById("archivos");
const guardarBtn = document.getElementById("guardarBtn");
const estadoDiv = document.getElementById("estado");
const listaTrabajos = document.getElementById("listaTrabajos");

/* ===============================
   GUARDAR TRABAJO
================================ */
guardarBtn.addEventListener("click", async () => {
  estadoDiv.textContent = "Guardando…";

  const titulo = tituloInput.value.trim();
  const descripcion = descInput.value.trim();
  const categoria = categoriaSelect.value;
  const archivos = archivosInput.files;

  if (!titulo || !descripcion || !categoria || archivos.length === 0) {
    estadoDiv.textContent = "Completá todos los campos";
    return;
  }

  /* 1️⃣ Crear galería */
  const { data: galeria, error: galeriaError } = await supabase
    .from("galeria")
    .insert({
      titulo,
      descripcion,
      categoria,
      activo: true
    })
    .select()
    .single();

  if (galeriaError) {
    console.error("ERROR galeria:", galeriaError);
    estadoDiv.textContent = "Error al crear el trabajo";
    return;
  }

  /* 2️⃣ Subir archivos + registrar media */
  let orden = 1;

  for (const file of archivos) {
    function limpiarNombre(nombre) {
    return nombre
     .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // saca acentos
      .replace(/[^a-zA-Z0-9._-]/g, "_") // solo chars válidos
      .toLowerCase();
      }

    const fileName = `${Date.now()}-${limpiarNombre(file.name)}`;

    const path = `${categoria}/${fileName}`;

    /* Upload */
    const { error: uploadError } = await supabase
      .storage
      .from("galeria")
      .upload(path, file);

    if (uploadError) {
      console.error("ERROR upload:", uploadError);
      estadoDiv.textContent = "Error subiendo archivo";
      return;
    }

    /* URL pública */
    const { data: urlData } = supabase
      .storage
      .from("galeria")
      .getPublicUrl(path);

    const url = urlData.publicUrl;

    /* Insert galeria_media */
    const { error: mediaError } = await supabase
      .from("galeria_media")
      .insert({
        galeria_id: galeria.id,
        tipo: file.type.startsWith("video") ? "video" : "img",
        url,
        orden
      });

    if (mediaError) {
      console.error("ERROR galeria_media:", mediaError);
      estadoDiv.textContent = "Error guardando media";
      return;
    }

    orden++;
  }

  estadoDiv.textContent = "✔ Trabajo cargado correctamente";

  tituloInput.value = "";
  descInput.value = "";
  categoriaSelect.value = "";
  archivosInput.value = "";

  cargarTrabajos();
});

/* ===============================
   LISTAR TRABAJOS
================================ */
async function cargarTrabajos() {
  const { data, error } = await supabase
    .from("galeria")
    .select("id, titulo, categoria, activo")
    .order("id", { ascending: false });

  if (error) {
    console.error("ERROR listar:", error);
    return;
  }

  listaTrabajos.innerHTML = "";

  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "trabajo";

    div.innerHTML = `
  <strong>${t.titulo}</strong><br>
  <small>Categoría: ${t.categoria}</small><br>
  <small>Estado: ${t.activo ? "Activo" : "Oculto"}</small>

  <div class="acciones">
    <button onclick="editarTrabajo(${t.id})">Editar</button>
    <button onclick="toggleTrabajo(${t.id}, ${t.activo})">
      ${t.activo ? "Ocultar" : "Activar"}
    </button>
    <button onclick="eliminarTrabajo(${t.id})">Eliminar</button>
  </div>
`;


    listaTrabajos.appendChild(div);
  });
}

window.editarTrabajo = (id) => {
  window.location.href = `editar-trabajo.html?id=${id}`;
};


/* ===============================
   ACTIVAR / DESACTIVAR
================================ */
window.toggleTrabajo = async (id, estadoActual) => {
  const { error } = await supabase
    .from("galeria")
    .update({ activo: !estadoActual })
    .eq("id", id);

  if (error) {
    console.error("ERROR toggle:", error);
    return;
  }

  cargarTrabajos();
};

/* ===============================
   ELIMINAR TRABAJO
================================ */
window.eliminarTrabajo = async (id) => {
  if (!confirm("¿Eliminar este trabajo?")) return;

  await supabase.from("galeria_media").delete().eq("galeria_id", id);
  await supabase.from("galeria").delete().eq("id", id);

  cargarTrabajos();
};

/* ===============================
   INIT
================================ */
cargarTrabajos();
