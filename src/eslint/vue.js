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
	{
		// Reserve `$fetch()` for user-triggered requests (event handlers,
		// mutations). Data loading in setup should go through
		// `useFetch()`/`useAsyncData()` so it gets SSR payload transfer, request
		// dedupe, and consistent pending/error state. We only flag the data-loading
		// positions — a top-level `await $fetch()` in <script setup> and `$fetch()`
		// inside a lifecycle hook — not `$fetch()` inside function bodies, which is
		// the correct pattern for handlers.
		//
		// NB: like `no-restricted-imports`, ESLint keeps only the LAST
		// `no-restricted-syntax` block per file — no concern above sets it, so a
		// consuming repo that adds its own must fold these selectors in (see README).
		files: ["**/*.vue"],
		rules: {
			"no-restricted-syntax": [
				"error",
				{
					selector:
						"CallExpression[callee.name=/^(onMounted|onBeforeMount|onServerPrefetch)$/] CallExpression[callee.name='$fetch']",
					message:
						"Load data with useFetch()/useAsyncData(), not $fetch() in a lifecycle hook. Reserve $fetch() for user-triggered requests (event handlers, mutations).",
				},
				{
					selector:
						"Program > VariableDeclaration > VariableDeclarator > AwaitExpression > CallExpression[callee.name='$fetch']",
					message:
						"Load data with useFetch()/useAsyncData(), not a top-level await $fetch() in setup. Reserve $fetch() for user-triggered requests (event handlers, mutations).",
				},
				{
					selector:
						"Program > ExpressionStatement > AwaitExpression > CallExpression[callee.name='$fetch']",
					message:
						"Load data with useFetch()/useAsyncData(), not a top-level await $fetch() in setup. Reserve $fetch() for user-triggered requests (event handlers, mutations).",
				},
			],
		},
	},
];
