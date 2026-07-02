/**
 * Concern: escape hatch for repos compiled WITHOUT `strictNullChecks`.
 *
 * The type-aware rules below are only sound when the consumer's tsconfig has
 * `strictNullChecks` on. Without it, `null`/`undefined` vanish from every type
 * the rules inspect: each rule self-reports "This rule requires the
 * `strictNullChecks` compiler option" at 0:1 — and then runs anyway, treating
 * every optional property as always-present.
 *
 * That would be mere noise, except their AUTOFIXES also apply — including for
 * diagnostics grandfathered into an eslint-suppressions baseline, which
 * suppresses the report but not the fix. A routine `--fix` (lint-staged, CI)
 * then rewrites behavior silently. Observed in account-nuxt-app:
 *   - no-useless-default-assignment deleted a live destructuring default
 *     (`const { fallbackVariant = "control" } = options`).
 *   - no-unnecessary-type-assertion stripped `as` casts that vue-tsc requires,
 *     breaking typecheck in a lint "fix".
 *   - different-types-comparison reported `x !== null` as always-true and
 *     pushed `!=` rewrites.
 *
 * Append this concern AFTER a preset in repos that compile with
 * `strict: false` (e.g. Nuxt apps setting
 * `typescript.tsConfig.compilerOptions.strict = false`). Remove it — and reap
 * the extra coverage — as soon as the repo turns `strictNullChecks` on.
 */
export default [
	{
		rules: {
			"@typescript-eslint/no-unnecessary-condition": "off",
			"@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
			"@typescript-eslint/prefer-nullish-coalescing": "off",
			"@typescript-eslint/no-useless-default-assignment": "off",
			"@typescript-eslint/no-unnecessary-type-assertion": "off",
			"@typescript-eslint/no-unnecessary-type-conversion": "off",
			"sonarjs/different-types-comparison": "off",
		},
	},
];
