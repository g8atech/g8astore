// Scarica da Brain le guide approvate e firmate di un sito (RPC pubblica guide_pubblicate) e le scrive in un file del repo.
// Usato dal workflow "Guide di Nina" ogni ora: se il file non cambia non si committa nulla (e il sito non si ricostruisce).
// Uso: node scripts/sync-guide.mjs <sito> <file> [ts|json]
import { readFileSync, writeFileSync } from "node:fs";

const [sito, file, formato = file.endsWith(".ts") ? "ts" : "json"] = process.argv.slice(2);
if (!sito || !file) { console.error("uso: node scripts/sync-guide.mjs <sito> <file> [ts|json]"); process.exit(2); }
const URL_RPC = "https://ijrrnuurjbgugystlfry.supabase.co/rest/v1/rpc/guide_pubblicate";
// Chiave pubblica (anon), la stessa delle pagine pubbliche: la funzione restituisce solo le guide firmate.
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcnJudXVyamJndWd5c3RsZnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTI0ODAsImV4cCI6MjA3OTkyODQ4MH0.4Txk3QeCKIUBjdPUC6MmUkepivU60qHV2gZUu68X7c8";

const res = await fetch(URL_RPC, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_sito: sito }) });
if (!res.ok) { console.error("Brain non risponde:", res.status, await res.text()); process.exit(1); }
const guide = await res.json();
if (!Array.isArray(guide)) { console.error("Risposta inattesa"); process.exit(1); }
// Ordine stabile e solo campi attesi: niente commit inutili
const pulite = guide.map((g) => ({
  slug: g.slug, titolo: g.titolo, h1: g.h1, descrizione: g.descrizione, intro: g.intro, in_breve: g.in_breve ?? [],
  sezioni: g.sezioni ?? [], faq: g.faq ?? [], link: g.link ?? [], extra: g.extra ?? {}, copertina: g.copertina ?? null,
  firmato_da: g.firmato_da, pubblicata_il: g.pubblicata_il, aggiornata_il: g.aggiornata_il,
})).sort((a, b) => (b.pubblicata_il ?? "").localeCompare(a.pubblicata_il ?? "") || a.slug.localeCompare(b.slug));
const corpo = JSON.stringify(pulite, null, 2);
const testo = formato === "ts"
  ? `// File generato da scripts/sync-guide.mjs (workflow "Guide di Nina"): guide di ${sito} approvate e firmate in Brain.\n// Non modificarlo a mano: si corregge in Brain → Marketing → Guide.\n/* eslint-disable */\nexport const GUIDE_NINA: any[] = ${corpo};\n`
  : `${corpo}\n`;
let prima = "";
try { prima = readFileSync(file, "utf8"); } catch { /* nuovo */ }
if (prima === testo) { console.log(`${sito}: nessuna novità (${pulite.length} guide)`); process.exit(0); }
writeFileSync(file, testo);
console.log(`${sito}: aggiornato ${file} (${pulite.length} guide)`);
