const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");
const desc = document.getElementById("modal-desc");
const media = document.querySelector(".modal-media");

const proyectos = {
  1: {
    title: "Cocina a medida",
    desc: "Cocina realizada en melamina premium con herrajes soft.",
    media: `<img src="../Images/cocina/1.jpg"><img src="../Images/cocina/2.jpg">`
  },
  2: {
    title: "Placard corredizo",
    desc: "Placard de 2 puertas corredizas en melamina color Venecia de 18mm, módulo de placard realizado con melamina color blanco de 18mm, 4 cajones, cubículos, y perchas.",
    media: `<video controls src="video/placard.mp4"></video>`
  },
  3: {
    title: "Placard corredizo",
    desc: "Mueble lavatorio en madera maciza cedrillo, pintado en algarrobo y finalizado con hidrolaca.\n2 cajones grandes a la vista + un cajón oculto, correderas telescópicas cierre suave y patas cromadas, piedra beige de kuarzo y zócalos + griferia alta para lavatorio.\nADICIONAL: Tapa de mochila + estante colgante",
    media: `<video controls src="video/placard.mp4"></video>`
  },
  4: {
    title: "Placard corredizo",
    desc: "Placard con puertas espejadas.",
    media: `<video controls src="video/placard.mp4"></video>`
  }
};

function openModal(id) {
  title.innerText = proyectos[id].title;
  desc.innerText = proyectos[id].desc;
  media.innerHTML = proyectos[id].media;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  media.innerHTML = "";
}

// FILTRO
document.querySelectorAll(".filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".active").classList.remove("active");
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