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
const grid  = document.querySelector(".grid");
const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");
const desc  = document.getElementById("modal-desc");
const media = document.querySelector(".modal-media");

/* ===============================
   CARGAR GALERÍA
================================ */
async function cargarGaleria() {
  const { data, error } = await supabase
    .from("galeria")
    .select(`
      id,
      titulo,
      descripcion,
      categoria,
      galeria_media (
        url,
        tipo,
        orden
      )
    `)
    .eq("activo", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error galería:", error);
    return;
  }

  grid.innerHTML = "";

  data.forEach(proyecto => {
    const card = document.createElement("article");
    card.className = `card ${proyecto.categoria}`;
    card.addEventListener("click", () => openModal(proyecto));

    const portada = proyecto.galeria_media.find(m => m.tipo === "img");

    card.innerHTML = `
      <img src="${portada?.url || ""}" alt="${proyecto.titulo}">
      <h3>${proyecto.titulo}</h3>
    `;

    grid.appendChild(card);
  });
}

/* ===============================
   MODAL
================================ */
function openModal(proyecto) {
  title.textContent = proyecto.titulo;
  desc.textContent  = proyecto.descripcion;
  media.innerHTML   = "";

  proyecto.galeria_media.forEach(item => {
    let el;

    if (item.tipo === "img") {
      el = document.createElement("img");
      el.src = item.url;
      el.alt = proyecto.titulo;
    }

    if (item.tipo === "video") {
      el = document.createElement("video");
      el.src = item.url;
      el.controls = true;
    }

    media.appendChild(el);
  });

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.style.display = "none";
  media.innerHTML = "";
  document.body.style.overflow = "";
}

/* ===============================
   EVENTOS MODAL
================================ */
window.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* ===============================
   FILTROS
================================ */
document.querySelectorAll(".filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".active")?.classList.remove("active");
    btn.classList.add("active");

    const filtro = btn.dataset.filter;

    document.querySelectorAll(".card").forEach(card => {
      card.style.display =
        filtro === "all" || card.classList.contains(filtro)
          ? "block"
          : "none";
    });
  });
});

/* ===============================
   FILTRO DESDE URL
================================ */
function aplicarFiltroDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria");
  if (!categoria) return;

  document.querySelectorAll(".filtros button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === categoria);
  });

  document.querySelectorAll(".card").forEach(card => {
    card.style.display =
      card.classList.contains(categoria) ? "flex" : "none";
  });
}

/* ===============================
   INIT
================================ */
(async () => {
  await cargarGaleria();
  aplicarFiltroDesdeURL();
})();
