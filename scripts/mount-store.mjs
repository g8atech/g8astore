// Monta il sito dentro g8a.it/store, dopo la build di Astro.
// Il sito è scritto come se fosse alla radice di www.g8astore.it; qui tutti i percorsi diventano /store/...
// e gli indirizzi assoluti diventano https://www.g8a.it/store/..., senza barra finale (come il resto di g8a.it).
// Poi tutto dist/ viene spostato in dist/store/, così questo progetto Vercel risponde già agli indirizzi /store/...
// e g8a.it lo può servire con una semplice rewrite.
import { readdir, readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join, extname } from "node:path";

const BASE = "/store";
const ORIGIN = "https://www.g8a.it";
const DIST = new URL("../dist/", import.meta.url).pathname;

// "/x/y/" -> "/store/x/y" ; "/" -> "/store" ; mantiene ?query e #ancora
const fix = (p) => {
  if (p.startsWith("//") || p.startsWith(BASE + "/") || p === BASE) return p;
  const m = p.match(/^([^?#]*)(.*)$/);
  let path = m[1];
  const rest = m[2];
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return (path === "/" ? BASE : BASE + path) + rest;
};

const rewrite = (s) =>
  s
    // indirizzi assoluti del vecchio dominio
    .replace(/https:\/\/www\.g8astore\.it(\/[^"'<>\s)]*)?/g, (_, p = "/") => ORIGIN + fix(p))
    // attributi con percorso assoluto
    .replace(/((?:href|src|action|poster|data-[a-z-]+)=")(\/[^"]*)"/g, (_, a, p) => `${a}${fix(p)}"`)
    // srcset: più URL separati da virgole
    .replace(/(srcset=")([^"]*)"/g, (_, a, v) => a + v.split(",").map((part) => part.trim().replace(/^(\/\S*)/, (u) => fix(u))).join(", ") + '"')
    // url(/...) negli stili
    .replace(/url\((['"]?)(\/[^)'"]*)\1\)/g, (_, q, p) => `url(${q}${fix(p)}${q})`);

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) await walk(f);
    else if ([".html", ".xml", ".txt", ".json", ".webmanifest", ".css", ".js"].includes(extname(e.name))) {
      const s = await readFile(f, "utf8");
      const out = rewrite(s);
      if (out !== s) await writeFile(f, out);
    }
  }
}

await walk(DIST);
// sposta tutto in dist/store/
const items = await readdir(DIST);
await mkdir(join(DIST, "store"), { recursive: true });
for (const it of items) if (it !== "store") await rename(join(DIST, it), join(DIST, "store", it));
// Alla radice di questo progetto (g8astore.vercel.app) non si indicizza nulla: le pagine vere sono su www.g8a.it/store.
await writeFile(join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(join(DIST, "store", "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log(`[mount-store] ${items.length} voci spostate in dist/store, percorsi riscritti su ${ORIGIN}${BASE}`);
