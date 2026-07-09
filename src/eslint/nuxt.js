/**
 * Public preset: nuxt — Nuxt 4 / Vue 3 app on the Cloudflare Workers runtime.
 *
 * core + Cloudflare Workers concern + Vue/Nuxt concern + webGUI globals,
 * prettier last (after the Vue layer, so its stylistic rules are disabled).
 */
import prettier from "eslint-config-prettier";
import core from "./core.js";
import cloudflareWorkers from "./cloudflare-workers.js";
import vue from "./vue.js";
import { webguiGlobals } from "./globals.js";

export default [
  ...core,
  ...cloudflareWorkers,
  ...vue,
  {
    languageOptions: {
      globals: { ...webguiGlobals },
    },
  },
  prettier,
];
