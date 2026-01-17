console.log("✅ contacto.js cargado");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "TU_ANON_KEY"
);

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("contactStatus");

console.log("📌 form encontrado:", form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("🟡 submit interceptado");

  statusEl.textContent = "Enviando...";


  const nombre = document.getElementById("c_nombre").value.trim();
  const tel = document.getElementById("c_tel").value.trim();
  const msg = document.getElementById("c_msg").value.trim();

  try {
    const { error } = await supabase.functions.invoke("contacto-email", {
      body: { nombre, tel, msg },
    });

    if (error) throw error;

    statusEl.textContent = "Listo. Te respondemos a la brevedad.";
    form.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error al enviar. Probá de nuevo.";
  }
});
