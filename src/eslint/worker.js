/**
 * Public preset: worker — plain (non-Nuxt) Cloudflare Worker / Node service.
 *
 * core + Cloudflare Workers concern, prettier last.
 */
import prettier from "eslint-config-prettier";
import core from "./core.js";
import cloudflareWorkers from "./cloudflare-workers.js";

export default [...core, ...cloudflareWorkers, prettier];
