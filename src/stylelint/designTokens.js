// Design-token enforcement for component/feature CSS.
//
// Forbids raw color literals so every color flows through a design token — a CSS
// custom property (`var(--…)`) — instead of being hardcoded. Centralizing color
// in tokens is what makes theming and light/dark handling work: a hardcoded hex
// or `rgb()`/`oklch()` value silently ignores the active theme, and a raw
// fallback baked into `var(--token, #abc)` masks a mistyped or missing token by
// rendering the literal instead of failing visibly.
//
// Scope: layer this on top of `./stylelint/base` for hand-authored component and
// feature stylesheets. The files that DEFINE tokens must hold raw color values,
// so opt those out per-file — either restrict the config's `files` to feature
// CSS, or add `/* stylelint-disable color-no-hex, function-disallowed-list */`
// at the top of a token-source file.
//
// Out of scope (intentionally): this cannot know a specific project's set of
// valid token names, so it does not catch a reference to a token that does not
// exist (e.g. `var(--color-made-up)`). Validating custom-property names against
// a known token registry is a project-level concern; add a repo-local allowlist
// rule for that. This preset guarantees the value is a token *reference* rather
// than a raw literal.
const DISALLOWED_COLOR_FUNCTIONS = [
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
];

export default {
  rules: {
    // Hex colors anywhere: #fff, #ffffff, #ffffffff.
    "color-no-hex": true,
    // Named colors: red, rebeccapurple, … (`transparent` and `currentColor`
    // are keywords, not named colors, so they remain allowed).
    "color-named": "never",
    // Raw color-producing functions in values — use a token reference instead.
    // `var()` and `color-mix()` are intentionally NOT listed, so tokens can
    // still be referenced and mixed.
    "function-disallowed-list": DISALLOWED_COLOR_FUNCTIONS,
  },
};
