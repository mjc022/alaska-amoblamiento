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
    desc: "Bajo mesada y alacena de 3,10mt de largo, modulos realizados con melamina blanca de 18mm, y frentes de cajones y puertas en melamina color gris grafito 18mm con manijas metalicas, bisagras cazoletas de 35mm premiun y correderas telescópicas de 45cm cierre suave",
    media: [
      { type: "img", src: "../Images/cocina/1.jpg" },
      { type: "img", src: "../Images/cocina/2.jpg" },
    ]
  },

  2: {
    title: "Placard corredizo",
    desc: "Placard de 2 puertas corredizas en melamina color Venecia de 18mm, módulo de placard realizado con melamina color blanco de 18mm, 4 cajones, cubículos, y perchas.",
    media: [
      { type: "img", src: "../Images/dormitorio/1.jpg" },
      { type: "img", src: "../Images/dormitorio/2.jpg" }
    ]
  },

  3: {
    title: "Lavatorio",
    desc: "Mueble lavatorio en madera maciza cedrillo, pintado en algarrobo y finalizado con hidrolaca.\n2 cajones grandes a la vista + un cajón oculto, correderas telescópicas cierre suave y patas cromadas, piedra beige de kuarzo y zócalos + griferia alta para lavatorio.\nADICIONAL: Tapa de mochila + estante colgante",
    media: [
      { type: "img", src: "../Images/bano/1.jpg" },
      { type: "img", src: "../Images/bano/2.jpg" }
    ]
  },

  4: {
    title: "Amoblamiento para local comercial",
    desc: "Bajo Mesada de 2,50mt + Alacena. Realizado con módulos blancos de 18mm y frentes de puertas y cajones en color verde oliva de 18mm",
    media: [
      { type: "img", src: "../Images/locales/1.jpg" },
      { type: "img", src: "../Images/locales/2.jpg" },
      { type: "video", src: "../videos/1.mp4" }
    ]
  },

  5: {
    title: "Cocina en L con vinoteca",
    desc: "Bajo mesada y alacena realizado en melamina de 18mm con módulos color blancos y frentes de cajones y puertas en color gris concreto, correderas telescópicas cierre suave, bisagras cazoleta de 35mm cierre suave premiun y perfiles de aluminio.\nSe le adicionó una hermosa vinoteca con luz led y estantes de vidrio.",
    media: [
      { type: "img", src: "../Images/cocina/4.jpg" },
      { type: "img", src: "../Images/cocina/5.jpg" },
    ]
  },

  6: {
    title: "Tocador",
    desc: "Tocador de melamina blanco de 18mm, con espejo de 60x40 más realizado de ranura para luces led embutidas y control remoto, 1 cajon con 2 divisiones adentro y correderas telescópicas cierre suave.",
    media: [
      { type: "img", src: "../Images/dormitorio/4.jpg" },
      { type: "img", src: "../Images/dormitorio/5.jpg" }
    ]
  },

  7: {
    title: "Mueble flotante para lavatorio",
    desc: "Tocador de melamina blanco de 18mm, con espejo de 60x40 más realizado de ranura para luces led embutidas y control remoto, 1 cajon con 2 divisiones adentro y correderas telescópicas cierre suave.",
    media: [
      { type: "img", src: "../Images/bano/3.jpg" },
      { type: "img", src: "../Images/bano/4.jpg" }
    ]
  },

  8: {
    title: "Diseño de zapatero",
    desc: "Diseño de zapatero moderno y funcional, optimizando el espacio disponible para almacenar calzado de manera ordenada y accesible. El diseño incluye estantes ajustables, compartimentos específicos para diferentes tipos de zapatos y un acabado elegante que complementa cualquier ambiente.", 
    media: [
      { type: "img", src: "../Images/diseno/1.jpg" },
      { type: "img", src: "../Images/diseno/2.jpg" },
      { type: "img", src: "../Images/diseno/3.jpg" }
    ]
  },

  9: {
    title: "Diseño de bajo mesada y alacena",
    desc: "Diseño de bajo mesada y alacena que maximiza el espacio de almacenamiento en la cocina, combinando funcionalidad y estética. El diseño incluye compartimentos específicos para utensilios, electrodomésticos y alimentos, con un acabado moderno que se adapta a cualquier estilo de cocina.",
    media: [
      { type: "img", src: "../Images/diseno/4.jpg" }
    ]
  },
  10: {
    title: "Diseño de lavatorio",
    desc: "Diseño de lavatorio elegante y funcional, pensado para optimizar el espacio en el baño. El diseño incluye un mueble con almacenamiento integrado, un lavabo moderno y detalles estéticos que aportan sofisticación al ambiente.",
    media: [
      { type: "img", src: "../Images/diseno/5.jpg" },
      { type: "img", src: "../Images/diseno/6.jpg" },
      { type: "img", src: "../Images/diseno/7.jpg" }
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
        ? "flex"
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

function aplicarFiltroDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get("categoria");

  if (!categoria) return;

  // activar botón
  document.querySelectorAll(".filtros button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.filter === categoria) {
      btn.classList.add("active");
    }
  });

  // filtrar cards
  document.querySelectorAll(".card").forEach(card => {
    card.style.display =
      card.classList.contains(categoria) ? "block" : "none";
  });
}

aplicarFiltroDesdeURL();
