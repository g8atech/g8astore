import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.g8astore.it",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "always" },
  integrations: [sitemap()],
});
