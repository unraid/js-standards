/**
 * @unraid/js-standards — plain Cloudflare Worker / Node service preset.
 *
 * The anti-slop base plus Workers runtime globals, for non-Nuxt packages
 * (standalone workers, shared libraries, lambdas).
 */
import base from "./base.js";
import { cloudflareWorkerGlobals } from "./globals.js";

export default [
	...base,
	{
		languageOptions: {
			globals: { ...cloudflareWorkerGlobals },
		},
	},
];
