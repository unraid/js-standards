/**
 * Concern: Vue / Nuxt SFCs.
 *
 * Nuxt's own flat config (SFC parsing, auto-import + generated-component
 * awareness) plus our team conventions. `createConfigForNuxt()` returns a lazy
 * FlatConfigComposer, so we resolve it to a plain array (top-level await) to
 * keep this concern spreadable.
 *
 * NB: this pulls Nuxt's bundled typescript-eslint / unicorn / import-x. When
 * composed with the `typescript` + `quality` concerns, consumers must dedupe
 * those to a single version (see README → pnpm overrides) or ESLint throws
 * "Cannot redefine plugin".
 */
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";

const nuxtConfigs = await createConfigForNuxt().toConfigs();

export default [
	...nuxtConfigs,
	{
		rules: {
			// Nuxt auto-imports + generated component types make these noisy/wrong.
			"no-undef": "off",
			"vue/no-undef-components": "off",

			// Team conventions carried over from the existing repo configs.
			"vue/multi-word-component-names": "off",
			"vue/no-multiple-template-root": "off",
			"vue/no-v-html": "off", // HTML is sanitized before render
			"vue/require-default-prop": "warn",

			// <script setup> blocks routinely exceed the function-size budget;
			// drop it here without losing it for plain modules.
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
