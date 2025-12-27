const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");
const desc = document.getElementById("modal-desc");
const media = document.querySelector(".modal-media");

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

const proyectos = {
  1: {
    title: "Amoblamiento de cocina 3,10 mts",
    desc: "Bajo mesada y alacena de 3,10 m con melamina blanca y frentes gris grafito.",
    media: [
      { type: "img", src: "../Images/cocina/1.jpg" },
      { type: "img", src: "../Images/cocina/2.jpg" },
      { type: "img", src: "../Images/cocina/3.jpg" }
    ]
  },

  2: {
    title: "Placard corredizo",
    desc: "Placard con puertas corredizas, interiores personalizados y cajonera.",
    media: [
      { type: "img", src: "../Images/dormitorio/1.jpg" },
      { type: "img", src: "../Images/dormitorio/2.jpg" }
    ]
  },

  3: {
    title: "Lavatorio",
    desc: "Mueble de baño en madera maciza con cajones y tapa de cuarzo.",
    media: [
      { type: "img", src: "../Images/bano/1.jpg" },
      { type: "img", src: "../Images/bano/2.jpg" }
    ]
  },

  4: {
    title: "Amoblamiento para local comercial",
    desc: "Muebles a medida para centro odontológico.",
    media: [
      { type: "img", src: "../Images/locales/1.jpg" },
      { type: "img", src: "../Images/locales/2.jpg" },
      { type: "video", src: "../videos/1.mp4" }
    ]
  }
};

function openModal(id) {
  const proyecto = proyectos[id];
  if (!proyecto) return;

  title.textContent = proyecto.title;
  desc.textContent = proyecto.desc;
  media.innerHTML = "";

  proyecto.media.forEach(item => {
    let element;

    if (item.type === "img") {
      element = document.createElement("img");
      element.src = item.src;
      element.alt = proyecto.title;
    }

    if (item.type === "video") {
      element = document.createElement("video");
      element.src = item.src;
      element.controls = true;
    }

    media.appendChild(element);
  });

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}


function closeModal() {
  modal.style.display = "none";
  media.innerHTML = "";
  document.body.style.overflow = "";
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


// FILTRO
document.querySelectorAll(".filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".active")?.classList.remove("active");
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    document.querySelectorAll(".card").forEach(card => {
      card.style.display =
        filter === "all" || card.classList.contains(filter)
        ? "block"
        : "none";
    });
  });
});
// CERRAR MODAL AL HACER CLICK FUERA
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}