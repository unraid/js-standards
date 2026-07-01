/**
 * @unraid/js-standards — Nuxt 4 / Vue 3 preset.
 *
 * Layers the anti-slop base with Nuxt's own flat config (Vue SFC parsing,
 * auto-import awareness) and the Cloudflare Workers + webGUI globals our Nuxt
 * apps run against. Repos append only their own overrides after this.
 *
 * `createConfigForNuxt()` returns a lazy FlatConfigComposer, so we resolve it
 * to a plain array (top-level await) to keep this preset spreadable.
 */
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import base from "./base.js";
import { cloudflareWorkerGlobals, webguiGlobals } from "./globals.js";

const nuxtConfigs = await createConfigForNuxt().toConfigs();

export default [
	...base,
	...nuxtConfigs,
	{
		languageOptions: {
			globals: { ...cloudflareWorkerGlobals, ...webguiGlobals },
		},
		rules: {
			// Nuxt auto-imports + generated component types make these noisy/wrong.
			"no-undef": "off",
			"vue/no-undef-components": "off",

			// Team conventions carried over from existing repo configs.
			"vue/multi-word-component-names": "off",
			"vue/no-multiple-template-root": "off",
			"vue/no-v-html": "off", // HTML is sanitized before render
			"vue/require-default-prop": "warn",

			// Vue SFCs frequently exceed the base function-size budget in
			// <script setup>; relax there without losing it for plain modules.
			"max-lines-per-function": "off",
		},
	},
	{
		// Vue component files may legitimately be PascalCase.
		files: ["**/*.vue"],
		rules: {
			"unicorn/filename-case": "off",
		},
	},
];
