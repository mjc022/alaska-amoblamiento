import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://jaubtlunajybgihikjrw.supabase.co",
  "sb_publishable_vvStv0iJTiwMYmGhy-JXqw_2DAfWH3z"
);

const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  location.href = "../View/login.html";
  throw new Error("No autorizado");
}
