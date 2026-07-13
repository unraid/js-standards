// Shared Stylelint baseline for hand-authored CSS.
//
// Pins `stylelint-config-standard` so every consumer holds CSS to the same
// correctness bar (valid syntax, no duplicate selectors/properties, modern
// color-function notation) without each repo re-picking the ruleset. Formatting
// is deliberately left to Prettier — `stylelint-config-standard` (v36+) is
// non-stylistic, so the two do not fight.
//
// This baseline is safe on ALL stylesheets, including the files that define
// design tokens (which legitimately hold raw color values). Layer
// `./stylelint/design-tokens` on top for component/feature CSS to additionally
// forbid raw color literals.
export default {
  extends: ["stylelint-config-standard"],
};
