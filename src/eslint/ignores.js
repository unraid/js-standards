/**
 * Concern: ignores. Build artifacts, generated files, and vendor dirs that no
 * preset should ever lint. Exported both as a raw array (to splice into a
 * repo's own `ignores`) and as a ready flat-config block.
 */
export const ignorePatterns = [
	"**/node_modules/**",
	"**/dist/**",
	"**/build/**",
	"**/runtime/**",
	"**/.output/**",
	"**/.nuxt/**",
	"**/.wrangler/**",
	"**/.vite/**",
	"**/coverage/**",
	"**/*.generated.ts",
	"**/worker-configuration.d.ts",
	"**/*.d.ts",
];

export default [{ ignores: ignorePatterns }];
