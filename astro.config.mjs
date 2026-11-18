import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFileSync } from "node:fs";

// Data di aggiornamento reale delle guide (da src/data/guideNina.ts, generato da Brain) per <lastmod> nella sitemap.
// Solo dove la data è vera: le altre pagine restano senza lastmod.
const guideDates = (() => {
  const out = {};
  try {
    const src = readFileSync(new URL("./src/data/guideNina.ts", import.meta.url), "utf8");
    const re = /"slug":\s*"([^"]+)"[\s\S]*?"aggiornata_il":\s*"(\d{4}-\d{2}-\d{2})/g;
    for (const m of src.matchAll(re)) out[`/guide/${m[1]}/`] = m[2];
  } catch {}
  return out;
})();

export default defineConfig({
  site: "https://www.g8astore.it",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "always" },
  integrations: [
    sitemap({
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (guideDates[path]) item.lastmod = guideDates[path];
        return item;
      },
    }),
  ],
});
