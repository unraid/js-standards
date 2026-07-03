/**
 * Concern: TypeScript type-safety.
 *
 * typescript-eslint strict-type-checked + stylistic, plus the extra type-safety
 * rules that most directly catch runtime failure modes (unsafe `any`, needless
 * guards, `||` where `??` is meant, promise mishandling). Type-aware rules run
 * only on real source; plain JS/config files get type-checking switched off.
 *
 * This concern is framework-agnostic — a plain TS library can consume it alone.
 *
 * REQUIRES `strictNullChecks` in the consumer's tsconfig. Without it, several
 * of these rules are unsound and their autofixes rewrite behavior; the rules
 * self-report the missing flag at 0:1 of every file — treat that as a
 * configuration error, not lintable debt. See README "Compatibility".
 */
import tseslint from "typescript-eslint";
import { TS_SOURCE, JS_FILES } from "./globs.js";

export default tseslint.config(
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,

	{
		files: TS_SOURCE,
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: process.cwd(),
			},
		},
		rules: {
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
			"@typescript-eslint/return-await": ["error", "in-try-catch"],

			// Objects/any in template strings are real bugs ("[object Object]");
			// plain numbers in templates are not — allow them to cut the noise.
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{ allowNumber: true, allowBoolean: true },
			],
		},
	},

	// Plain JS + config files: keep lint, drop type-aware rules.
	{
		files: JS_FILES,
		...tseslint.configs.disableTypeChecked,
	},
);
