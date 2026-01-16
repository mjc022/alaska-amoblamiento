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
const nombreInput  = document.getElementById("nombre");
const coleccionSel = document.getElementById("coleccion");
const imagenFile   = document.getElementById("imagenFile");
const guardarBtn   = document.getElementById("guardarBtn");
const lista        = document.getElementById("lista");

/* ===============================
   STATE
================================ */
let editandoId = null;

/* ===============================
   LOAD
================================ */
async function cargarTerminaciones() {
  const { data, error } = await supabase
    .from("terminaciones")
    .select("*")
    .order("coleccion")
    .order("orden");

  if (error) {
    console.error(error);
    return;
  }

  lista.innerHTML = "";

  data.forEach(t => {
    const item = document.createElement("div");
    item.className = "material-item";

    item.innerHTML = `
      <div class="info">
        <strong>${t.nombre}</strong><br>
        <small>${t.coleccion}</small>
      </div>

      <div class="acciones">
        <img src="${t.imagen_url}" style="height:40px;border-radius:4px">

        <label>
          <input type="checkbox" ${t.activo ? "checked" : ""}>
          Activo
        </label>

        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    /* toggle activo */
    item.querySelector("input").onchange = e =>
      supabase
        .from("terminaciones")
        .update({ activo: e.target.checked })
        .eq("id", t.id);

    /* editar */
    item.querySelector(".edit").onclick = () => cargarEdicion(t);

    /* eliminar */
    item.querySelector(".delete").onclick = async () => {
      if (!confirm(`Eliminar "${t.nombre}"?`)) return;
      await supabase.from("terminaciones").delete().eq("id", t.id);
      cargarTerminaciones();
    };

    lista.appendChild(item);
  });
}

/* ===============================
   ORDEN AUTOMÁTICO
================================ */
async function obtenerProximoOrden(coleccion) {
  const { data } = await supabase
    .from("terminaciones")
    .select("orden")
    .eq("coleccion", coleccion)
    .order("orden", { ascending: false })
    .limit(1);

  return data.length ? data[0].orden + 1 : 1;
}

/* ===============================
   UPLOAD
================================ */
async function subirImagen(file, coleccion) {
  const ext = file.name.split(".").pop();
  const nombre = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const ruta = `${coleccion}/${nombre}`;

  const { error } = await supabase.storage
    .from("terminaciones")
    .upload(ruta, file);

  if (error) throw error;

  return supabase.storage
    .from("terminaciones")
    .getPublicUrl(ruta).data.publicUrl;
}

/* ===============================
   SAVE
================================ */
guardarBtn.onclick = async () => {
  if (!nombreInput.value) return alert("Falta el nombre");

  if (!editandoId && imagenFile.files.length === 0)
    return alert("Tenés que subir una imagen");

  let imagen_url = null;

  if (imagenFile.files.length) {
    imagen_url = await subirImagen(
      imagenFile.files[0],
      coleccionSel.value
    );
  }

  const payload = {
    nombre: nombreInput.value,
    coleccion: coleccionSel.value
  };

  if (!editandoId) {
    payload.orden = await obtenerProximoOrden(coleccionSel.value);
    payload.activo = true;
  }

  if (imagen_url) payload.imagen_url = imagen_url;

  if (editandoId) {
    await supabase
      .from("terminaciones")
      .update(payload)
      .eq("id", editandoId);
  } else {
    await supabase
      .from("terminaciones")
      .insert(payload);
  }

  resetForm();
  cargarTerminaciones();
};

/* ===============================
   EDIT
================================ */
function cargarEdicion(t) {
  editandoId = t.id;
  nombreInput.value = t.nombre;
  coleccionSel.value = t.coleccion;
}

/* ===============================
   RESET
================================ */
function resetForm() {
  editandoId = null;
  nombreInput.value = "";
  imagenFile.value = "";
}

/* ===============================
   INIT
================================ */
cargarTerminaciones();
