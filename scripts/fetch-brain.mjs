// Legge da Brain (Supabase) i dati pubblici che servono al sito e li salva in src/data/brain.json.
// Gira prima di ogni build. Se Brain non risponde, la build usa l'ultimo brain.json salvato nel repo.
// Usa solo la chiave pubblica (anon): nessun dato riservato, nessuna chiave service_role.
import { writeFile, readFile } from "node:fs/promises";

const URL = process.env.BRAIN_SUPABASE_URL || "https://ijrrnuurjbgugystlfry.supabase.co";
const KEY = process.env.BRAIN_SUPABASE_ANON_KEY;
const OUT = new globalThis.URL("../src/data/brain.json", import.meta.url);

async function get(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

async function main() {
  if (!KEY) throw new Error("BRAIN_SUPABASE_ANON_KEY non impostata");

  // Sedi pubblicate sul sito (solo campi pubblici)
  const shops = await get(
    "shops?select=id,slug,city,address,zip,province,phone,whatsapp_number,email,opening_hours,location_hint" +
      "&is_active=eq.true&show_on_website=eq.true&order=slug"
  );
  const settings = await get("store_settings?select=shop_id,store_photo_url,g8a_store_photo_url,google_place_id,g8a_google_place_id");

  // Voti Google delle schede G8A STORE (ultimo snapshot)
  const pages = await get("gmb_pages?select=id,name,location,brand&active=eq.true&brand=eq.g8a");
  const ratings = {};
  for (const p of pages) {
    const snap = await get(`review_snapshots?select=snapshot_date,review_count,rating&gmb_page_id=eq.${p.id}&order=snapshot_date.desc&limit=1`);
    if (snap[0]) ratings[norm(p.location).replace(/^store /, "")] = snap[0];
  }

  const outShops = shops.map((s) => {
    const st = settings.find((x) => x.shop_id === s.id) || {};
    const key = Object.keys(ratings).find((k) => norm(s.city).startsWith(k) || k.startsWith(norm(s.city).split(" ")[0]));
    const r = key ? ratings[key] : null;
    return {
      slug: s.slug,
      city: s.city
        .toLowerCase()
        .split(" ")
        .map((w, i) => (i > 0 && ["con", "di", "del", "sul", "al"].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" "),
      address: s.address,
      zip: s.zip,
      province: (s.province || "").toUpperCase(),
      phone: s.phone,
      whatsapp: s.whatsapp_number || s.phone,
      email: s.email,
      hours: s.opening_hours,
      hint: s.location_hint ? s.location_hint.charAt(0).toUpperCase() + s.location_hint.slice(1).toLowerCase() : null,
      photo: st.g8a_store_photo_url || st.store_photo_url || null,
      placeId: st.g8a_google_place_id || null,
      rating: r ? r.rating : null,
      reviews: r ? r.review_count : null,
    };
  });

  // Listino riparazioni MacBook (modelli Notebook Apple e relative voci di listino)
  const models = await get("device_models?select=id,name,slug,status,brands(name)&type=eq.Notebook&status=eq.true&order=name");
  const ids = models.map((m) => m.id).join(",");
  const items = ids
    ? await get(`catalog_items?select=name,price,selling_price,warranty_months,device_model_id&status=eq.true&shop_id=is.null&device_model_id=in.(${ids})`)
    : [];
  const macModels = models
    .filter((m) => (m.brands?.name || "").toLowerCase() === "apple")
    .map((m) => ({
      slug: m.slug,
      name: m.name.replace(/’’|''/g, '"'),
      repairs: items
        .filter((i) => i.device_model_id === m.id)
        .map((i) => ({
          name: i.name,
          kind: /batteri/i.test(i.name) ? "batteria" : /display|schermo/i.test(i.name) ? "schermo" : "altro",
          price: Number(i.selling_price || i.price || 0),
          warrantyMonths: i.warranty_months,
        }))
        .filter((i) => i.price > 0)
        .sort((a, b) => a.price - b.price),
    }));

  const data = { fetchedAt: new Date().toISOString(), shops: outShops, macModels };
  await writeFile(OUT, JSON.stringify(data, null, 2) + "\n");
  console.log(`Brain: ${outShops.length} sedi, ${macModels.length} modelli Mac`);
}

main().catch(async (e) => {
  try {
    await readFile(OUT);
    console.warn(`Brain non raggiungibile (${e.message}): uso l'ultimo brain.json salvato.`);
  } catch {
    console.error(`Brain non raggiungibile e nessun brain.json salvato: ${e.message}`);
    process.exit(1);
  }
});
