import "./guard.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const tituloInput = document.getElementById("titulo");
const descInput = document.getElementById("descripcion");
const categoriaSelect = document.getElementById("categoria");
const mediaList = document.getElementById("mediaList");
const estado = document.getElementById("estado");

/* ===============================
   CARGAR TRABAJO
================================ */
async function cargarTrabajo() {
  const { data, error } = await supabase
    .from("galeria")
    .select(`
      id,
      titulo,
      descripcion,
      categoria,
      galeria_media (
        id,
        url,
        tipo,
        orden
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    estado.textContent = "Error cargando trabajo";
    return;
  }

  tituloInput.value = data.titulo;
  descInput.value = data.descripcion;
  categoriaSelect.value = data.categoria;

  renderMedia(data.galeria_media);
}

/* ===============================
   MEDIA
================================ */
function renderMedia(media) {
  mediaList.innerHTML = "";

  media
    .sort((a, b) => a.orden - b.orden)
    .forEach(m => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";

      div.innerHTML = `
        ${m.tipo === "img"
          ? `<img src="${m.url}" style="max-width:150px">`
          : `<video src="${m.url}" controls style="max-width:150px"></video>`}
        <br>
        <button onclick="subir(${m.id}, ${m.orden})">⬆</button>
        <button onclick="bajar(${m.id}, ${m.orden})">⬇</button>
        <button onclick="borrarMedia(${m.id})">🗑</button>
      `;

      mediaList.appendChild(div);
    });
}

/* ===============================
   GUARDAR CAMBIOS
================================ */
document.getElementById("guardarCambios").onclick = async () => {
  await supabase
    .from("galeria")
    .update({
      titulo: tituloInput.value,
      descripcion: descInput.value,
      categoria: categoriaSelect.value
    })
    .eq("id", id);

  estado.textContent = "Cambios guardados";
};

/* ===============================
   BORRAR MEDIA
================================ */
window.borrarMedia = async (mediaId) => {
  if (!confirm("Eliminar archivo?")) return;

  await supabase.from("galeria_media").delete().eq("id", mediaId);
  cargarTrabajo();
};

/* ===============================
   ORDEN
================================ */
window.subir = async (mediaId, orden) => {
  await supabase.from("galeria_media")
    .update({ orden: orden - 1 })
    .eq("id", mediaId);
  cargarTrabajo();
};

window.bajar = async (mediaId, orden) => {
  await supabase.from("galeria_media")
    .update({ orden: orden + 1 })
    .eq("id", mediaId);
  cargarTrabajo();
};

/* ===============================
   AGREGAR ARCHIVOS
================================ */
document.getElementById("agregarArchivos").onclick = async () => {
  const files = document.getElementById("nuevosArchivos").files;

  let { data: last } = await supabase
    .from("galeria_media")
    .select("orden")
    .eq("galeria_id", id)
    .order("orden", { ascending: false })
    .limit(1);

  let orden = last?.[0]?.orden || 1;

  for (const file of files) {
    const path = `${categoriaSelect.value}/${id}/${Date.now()}-${file.name}`;

    await supabase.storage.from("galeria").upload(path, file);

    const url = supabase.storage.from("galeria").getPublicUrl(path).data.publicUrl;

    await supabase.from("galeria_media").insert({
      galeria_id: id,
      tipo: file.type.startsWith("video") ? "video" : "img",
      url,
      orden: ++orden
    });
  }

  cargarTrabajo();
};

/* ===============================
   INIT
================================ */
cargarTrabajo();
