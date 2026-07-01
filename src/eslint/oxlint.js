/**
 * Concern: Oxlint dedupe (opt-in).
 *
 * When you run the Oxlint pre-pass (see `oxlint/base`), append this LAST in your
 * ESLint config so ESLint turns OFF every rule Oxlint already covers. That
 * avoids double-reporting and trims the slow ESLint run down to what only it can
 * do (type-aware + Vue + the anti-slop plugins Oxlint lacks).
 *
 *   import unraid from "@unraid/js-standards/eslint/nuxt";
 *   import oxlintDisable from "@unraid/js-standards/eslint/oxlint";
 *
 *   export default [
 *     ...unraid,
 *     ...oxlintDisable(),   // must be last
 *   ];
 *
 * Deterministically derived from THIS package's `oxlint/base.json`, so the two
 * configs can never drift.
 */
import { fileURLToPath } from "node:url";
// eslint-plugin-oxlint's ESM entry only exports `default`; the builders hang off
// it as properties, so we destructure rather than named-import.
import oxlintPlugin from "eslint-plugin-oxlint";

const { buildFromOxlintConfigFile } = oxlintPlugin;

const sharedOxlintConfig = fileURLToPath(new URL("../oxlint/base.json", import.meta.url));

/**
 * @param {string} [oxlintConfigPath] Path to the oxlint config whose enabled
 *   rules should be disabled in ESLint. Defaults to this package's shared base.
 * @returns {import("eslint").Linter.Config[]}
 */
export default function oxlintDisable(oxlintConfigPath = sharedOxlintConfig) {
	return buildFromOxlintConfigFile(oxlintConfigPath);
}
