/**
 * Concern: code quality. Framework-agnostic. The rules that catch low-quality
 * and error-prone patterns, split by intent below:
 *
 *   - correctness footguns        (eqeqeq, no-console, no-nested-ternary…)
 *   - redundant comments          (deslop, no-warning-comments)
 *   - eslint-disable abuse        (@eslint-community/eslint-comments)
 *   - complexity / size budgets   (warn + ratchet — you can't refactor a
 *                                  backlog at once; gate new code first)
 *   - duplication                 (sonarjs — catches copy-paste)
 *   - import hygiene              (syntactic import-x rules; tsc owns resolution)
 *
 * Pure-opinion / stack-hostile rules (unicorn name/abbreviation nagging, etc.)
 * are explicitly disabled so the signal-to-noise stays high.
 */
import js from "@eslint/js";
import globals from "globals";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import importX from "eslint-plugin-import-x";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import deslop from "eslint-plugin-deslop";

export default [
	js.configs.recommended,
	unicorn.configs.recommended,
	sonarjs.configs.recommended,
	comments.recommended,
	{
		plugins: { deslop, "import-x": importX },
		languageOptions: {
			globals: { ...globals.node },
		},
		rules: {
			// --- Correctness footguns
			eqeqeq: ["error", "always", { null: "ignore" }],
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-debugger": "error",
			"no-alert": "error",
			"no-nested-ternary": "error",
			"no-param-reassign": "error",

			// --- Redundant comments that just restate the code (heuristic → warn)
			"deslop/no-obvious-comments": "warn",
			"no-warning-comments": [
				"warn",
				{ terms: ["todo", "fixme", "xxx", "hack", "placeholder"], location: "anywhere" },
			],

			// --- Blanket eslint-disable abuse (silencing rules instead of fixing)
			"@eslint-community/eslint-comments/no-unlimited-disable": "error",
			"@eslint-community/eslint-comments/no-unused-disable": "error",
			"@eslint-community/eslint-comments/require-description": [
				"error",
				{ ignore: ["eslint-enable"] },
			],

			// --- Complexity / size budgets: warn + ratchet (gate new code, don't
			//     red-wall the existing backlog). Flip to "error" per repo once
			//     the baseline is under budget.
			complexity: ["warn", { max: 12 }],
			"max-depth": ["warn", 4],
			"max-nested-callbacks": ["warn", 3],
			"max-params": ["warn", 4],
			"max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
			"max-lines-per-function": [
				"warn",
				{ max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
			],
			"sonarjs/cognitive-complexity": ["warn", 15],

			// --- Duplication (catches copy-paste)
			"sonarjs/no-duplicate-string": ["error", { threshold: 4 }],
			"sonarjs/no-identical-functions": "error",

			// --- Import hygiene: only syntactic rules (no resolver → no false
			//     positives on Nuxt aliases / Workers virtual modules). Cycle
			//     detection is left to dependency-cruiser.
			"import-x/no-duplicates": "error",
			"import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"import-x/no-mutable-exports": "error",

			// --- Unicorn: keep the sharp rules, silence the pure-opinion nagging
			//     that fights domain naming and our stack.
			"unicorn/prevent-abbreviations": "off",
			"unicorn/name-replacements": "off",
			"unicorn/consistent-boolean-name": "off",
			"unicorn/no-null": "off",
			"unicorn/filename-case": "off",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/prefer-ternary": "off",
			"unicorn/no-useless-undefined": "off",
		},
	},
];
