/**
 * Shared file-glob groups used across every concern, so a change to what counts
 * as "source" vs "test" vs "tooling" happens in exactly one place.
 */

/** Real, type-checked source. */
export const TS_SOURCE = ["**/*.{ts,tsx,mts,cts,vue}"];

/** Plain JS / config files — linted, but not type-aware. */
export const JS_FILES = ["**/*.{js,mjs,cjs,jsx}"];

/** Test files — a few limits relaxed (fixtures duplicate strings, etc.). */
export const TEST_FILES = ["**/*.{spec,test}.{ts,tsx,js,mjs}", "**/tests/**", "**/__tests__/**"];

/** Config / script files that legitimately need console + default exports. */
export const TOOLING_FILES = [
	"**/*.config.{ts,mts,cts,js,mjs,cjs}",
	"**/scripts/**",
	"eslint.config.*",
];
