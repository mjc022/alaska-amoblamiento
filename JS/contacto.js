import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("contactStatus");
const btn = form.querySelector('button[type="submit"]');

let sending = false;
let statusTimer = null;

/* ===============================
   UI STATUS
================================ */
function setStatus(text, kind = "info") {
  // kind: info | ok | err
  statusEl.textContent = text;
  statusEl.style.color =
    kind === "err" ? "#b00020" : kind === "ok" ? "#1e7e34" : "";

  clearTimeout(statusTimer);
  if (kind !== "info") {
    statusTimer = setTimeout(() => {
      statusEl.textContent = "";
      statusEl.style.color = "";
    }, 6000);
  }
}

/* ===============================
   UTILS
================================ */
function normalizeTel(tel) {
  return tel.replace(/[^\d+]/g, "").slice(0, 25);
}

/* ===============================
   SUBMIT
================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (sending) return;

  const nombre = document.getElementById("c_nombre").value.trim();
  const tel = normalizeTel(document.getElementById("c_tel").value.trim());
  const msg = document.getElementById("c_msg").value.trim();

  // Honeypot (si está lleno, es bot)
  const hp = document.getElementById("c_web")?.value?.trim();
  if (hp) return;

  // 🔒 VALIDACIONES OBLIGATORIAS
  if (!nombre) return setStatus("Completá tu nombre.", "err");
  if (nombre.length < 2) return setStatus("El nombre es muy corto.", "err");

  if (!tel) return setStatus("Completá tu teléfono.", "err");
  if (tel.length < 6) return setStatus("El teléfono no es válido.", "err");

  if (!msg) return setStatus("Escribí un mensaje.", "err");
  if (msg.length < 5)
    return setStatus("Contanos un poco más en el mensaje.", "err");

  try {
    sending = true;
    btn.disabled = true;
    btn.style.opacity = "0.7";
    setStatus("Enviando...", "info");

    const { data, error } = await supabase.functions.invoke("contacto-email", {
      body: { nombre, tel, msg },
    });

    if (error) throw error;
    if (data && data.ok === false) {
      throw new Error(data.error || "Error");
    }

    form.reset();
    setStatus("Listo. Te respondemos a la brevedad.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Error al enviar. Probá de nuevo.", "err");
  } finally {
    sending = false;
    btn.disabled = false;
    btn.style.opacity = "";
  }
});
