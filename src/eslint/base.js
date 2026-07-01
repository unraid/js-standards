/**
 * @unraid/js-standards — base ESLint preset (framework-agnostic TS/JS).
 *
 * Aggressive, type-aware, anti-slop ruleset intended to catch the failure
 * patterns common in AI-generated code: unhandled promises, unsafe `any`
 * flows, dead code, needless guards, over-long/over-complex functions,
 * copy-pasted duplication, and blanket eslint-disable comments.
 *
 * Consumers compose this array first, then layer framework presets (nuxt /
 * worker) and repo-specific overrides on top. Prettier-conflicting formatting
 * rules are disabled at the end so ESLint never fights the formatter.
 */
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import importX from "eslint-plugin-import-x";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import prettier from "eslint-config-prettier";
import deslopPlugin from "eslint-plugin-deslop";

/** Files that are real, type-checked source. */
const TS_SOURCE = ["**/*.{ts,tsx,mts,cts,vue}"];

/** Plain JS / config files — linted, but not type-aware. */
const JS_FILES = ["**/*.{js,mjs,cjs,jsx}"];

/** Test files get a few limits relaxed (fixtures duplicate strings, etc.). */
const TEST_FILES = ["**/*.{spec,test}.{ts,tsx,js,mjs}", "**/tests/**", "**/__tests__/**"];

/** Config / script files that legitimately need console + default exports. */
const TOOLING_FILES = [
	"**/*.config.{ts,mts,cts,js,mjs,cjs}",
	"**/scripts/**",
	"eslint.config.*",
];

export default tseslint.config(
	// ---- Global ignores -----------------------------------------------------
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"**/.output/**",
			"**/.nuxt/**",
			"**/.wrangler/**",
			"**/.vite/**",
			"**/coverage/**",
			"**/*.generated.ts",
			"**/worker-configuration.d.ts",
			"**/*.d.ts",
		],
	},

	// ---- Base recommended sets ---------------------------------------------
	js.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	unicorn.configs.recommended,
	sonarjs.configs.recommended,
	comments.recommended,

	// ---- Type-aware language options ---------------------------------------
	{
		files: TS_SOURCE,
		languageOptions: {
			globals: { ...globals.node },
			parserOptions: {
				projectService: true,
				tsconfigRootDir: process.cwd(),
			},
		},
	},

	// ---- Anti-slop rule hardening (applies to all linted files) -------------
	{
		plugins: { deslop: deslopPlugin, "import-x": importX },
		languageOptions: {
			globals: { ...globals.node },
		},
		rules: {
			// --- Type-safety escapes: AI reaches for these to make errors vanish
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-non-null-assertion": "error",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
			],
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/prefer-nullish-coalescing": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/no-floating-promises": "error",

			// --- Correctness footguns
			eqeqeq: ["error", "always", { null: "ignore" }],
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-debugger": "error",
			"no-alert": "error",
			"no-return-await": "off", // handled by @typescript-eslint/return-await
			"@typescript-eslint/return-await": ["error", "in-try-catch"],
			"no-nested-ternary": "error",
			"no-param-reassign": ["error", { props: true }],

			// --- AI comment slop (heuristic → warn, not a hard wall)
			"deslop/no-obvious-comments": "warn",
			"no-warning-comments": [
				"warn",
				{ terms: ["todo", "fixme", "xxx", "hack", "placeholder"], location: "anywhere" },
			],

			// --- Blanket eslint-disable abuse (very common in generated fixes)
			"@eslint-community/eslint-comments/no-unlimited-disable": "error",
			"@eslint-community/eslint-comments/no-unused-disable": "error",
			"@eslint-community/eslint-comments/require-description": [
				"error",
				{ ignore: ["eslint-enable"] },
			],

			// --- Complexity / size budgets: the strongest anti-slop levers
			complexity: ["error", { max: 12 }],
			"max-depth": ["error", 4],
			"max-nested-callbacks": ["error", 3],
			"max-params": ["error", 4],
			"max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
			"max-lines-per-function": [
				"error",
				{ max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
			],
			"sonarjs/cognitive-complexity": ["error", 15],

			// --- Duplication (copy-paste is an AI signature)
			"sonarjs/no-duplicate-string": ["error", { threshold: 4 }],
			"sonarjs/no-identical-functions": "error",

			// --- Import hygiene: TS/tsc owns module resolution, so we only enable
			//     the syntactic rules that don't need a resolver (which avoids
			//     false positives on Nuxt aliases + CF Workers virtual modules).
			//     Circular-dependency detection is left to dependency-cruiser.
			"import-x/no-duplicates": "error",
			"import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"import-x/no-mutable-exports": "error",

			// --- Unicorn: keep the sharp rules, drop the ones that fight our stack
			"unicorn/prevent-abbreviations": "off",
			"unicorn/no-null": "off",
			"unicorn/filename-case": "off",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/prefer-ternary": "off",
			"unicorn/no-useless-undefined": "off",
		},
	},

	// ---- Plain JS / config: keep lint, drop type-aware rules ----------------
	{
		files: JS_FILES,
		...tseslint.configs.disableTypeChecked,
	},

	// ---- Tooling / scripts: allow console + relax size -----------------------
	{
		files: TOOLING_FILES,
		rules: {
			"no-console": "off",
			"max-lines-per-function": "off",
			"import-x/no-extraneous-dependencies": "off",
		},
	},

	// ---- Tests: relax duplication + size, keep type safety ------------------
	{
		files: TEST_FILES,
		rules: {
			"no-console": "off",
			"max-lines": "off",
			"max-lines-per-function": "off",
			"max-nested-callbacks": "off",
			"sonarjs/no-duplicate-string": "off",
			"sonarjs/no-identical-functions": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
		},
	},

	// ---- Prettier last: turn off all formatting-related rules ----------------
	prettier,
);
