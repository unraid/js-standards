/**
 * @unraid/js-standards — shared knip base config.
 *
 * knip finds dead code the type-checker and ESLint miss: unused files, unused
 * exports, and unused/undeclared dependencies — the orphaned helpers and
 * phantom deps AI-generated changes leave behind.
 *
 * Consumers spread this and add project-specific `entry` points:
 *
 *   import base from "@unraid/js-standards/knip/base";
 *   export default { ...base, entry: [...base.entry, "server/index.ts"] };
 */

/** @type {import("knip").KnipConfig} */
const config = {
	// Common Nuxt / Workers entry points; extend per repo as needed.
	entry: [
		"nuxt.config.ts",
		"app.config.ts",
		"app/**/pages/**/*.vue",
		"server/**/routes/**/*.ts",
		"server/**/api/**/*.ts",
		"scripts/**/*.{ts,mjs,js}",
	],
	project: ["**/*.{ts,tsx,vue,mjs,js}"],
	ignore: [
		"**/*.generated.ts",
		"**/worker-configuration.d.ts",
		"**/.nuxt/**",
		"**/.output/**",
		"**/.wrangler/**",
		"**/coverage/**",
	],
	ignoreDependencies: [
		// Type-only + tooling packages knip can't always trace through configs.
		"@cloudflare/workers-types",
	],
	// Start lenient; tighten these to `false` per repo once the baseline is clean.
	ignoreExportsUsedInFile: true,
};

export default config;
