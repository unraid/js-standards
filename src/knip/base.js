/**
 * @unraid/js-standards — shared knip base config.
 *
 * knip finds dead code the type-checker and ESLint miss: unused files, unused
 * exports, and unused/undeclared dependencies — orphaned helpers and phantom
 * deps that accumulate as a codebase changes.
 *
 * Consumers spread this and add project-specific `entry` points:
 *
 *   import base from "@unraid/js-standards/knip/base";
 *   export default { ...base, entry: [...base.entry, "server/index.ts"] };
 */

/**
 * Deliberately minimal: do NOT override `entry` / `project`. knip auto-detects
 * Nuxt (and Cloudflare/wrangler) from the dependency graph and applies its
 * framework plugins, which understand auto-imported components, pages, and
 * server routes. Hardcoding entry globs disables that and produces false
 * "unused file" reports. We only add shared ignores + a lenient default that
 * repos tighten as their baseline gets clean.
 *
 * Nuxt 4 note: knip's Nuxt plugin does not yet treat the `app/` srcDir as
 * entry by default, so Nuxt 4 repos should add their own entry hint, e.g.
 *   entry: [...base.entry ?? [], 'app/**\/*.vue', 'app/**\/*.ts']
 * to avoid false "unused file" reports for auto-imported components.
 *
 * @type {import("knip").KnipConfig}
 */
const config = {
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
	// Start lenient; flip to `false` per repo once the baseline is clean.
	ignoreExportsUsedInFile: true,
};

export default config;
