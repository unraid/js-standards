/**
 * Concern: React (JSX / TSX) components + hooks + a11y.
 *
 * Layers React support onto the framework-agnostic core. It registers three
 * plugins — eslint-plugin-react, eslint-plugin-react-hooks, and
 * eslint-plugin-jsx-a11y — and applies only to component files (`.jsx` and
 * `.tsx`), so a plain `.ts`/`.js` module never pays for the React rules.
 *
 * Rule philosophy: this is a CURATED set for "correct React UI patterns +
 * anti-slop", not the full `react/recommended` wall. We keep the rules that
 * catch real render bugs (missing/unstable keys, components declared inside
 * render, dangerous target="_blank", unknown DOM props) and drop the noisy,
 * opinion-heavy ones. jsx-a11y's `recommended` flat config is spread in whole,
 * because accessibility defaults are worth having everywhere.
 *
 * Two rules are turned OFF on purpose:
 *   - `react/react-in-jsx-scope` — the modern JSX transform (React 17+,
 *     `jsx: "react-jsx"`) injects the runtime, so `import React` is no longer
 *     required in scope. Leaving this on would flag every correct component.
 *   - `react/prop-types` — TypeScript (the `typescript` concern) already owns
 *     prop typing; runtime prop-types are redundant and wrong for TS repos.
 *
 * Parser note: `.tsx` is parsed by typescript-eslint via the `typescript`
 * concern (which claims `.tsx` with `projectService`). Plain `.jsx` is
 * parsed by ESLint's default parser, which needs
 * `languageOptions.parserOptions.ecmaFeatures.jsx = true` to understand JSX —
 * set below (jsx-a11y's recommended config also sets it, but we set it
 * explicitly so the concern is correct even if that changes upstream).
 *
 * React-version note: `settings.react.version` is pinned to a concrete value
 * instead of the usual `"detect"`. On ESLint 10, `"detect"` CRASHES
 * eslint-plugin-react 7.37.5 — its version probe calls `context.getFilename()`,
 * a method ESLint removed in v10, so any version-gated rule
 * (`no-unstable-nested-components`, etc.) throws
 * "contextOrFilename.getFilename is not a function". No eslint-plugin-react
 * release supports ESLint 10 yet (7.37.5 is latest). Pinning the version skips
 * the broken detection path entirely; the enabled rules are not
 * React-major-sensitive, so a fixed value is safe. Flip back to `"detect"`
 * once the plugin ships an ESLint-10 fix.
 *
 * Composition note: like the `vue` concern, this pulls its own plugin
 * instances. It does NOT bundle typescript-eslint / unicorn, so it composes
 * cleanly with the `typescript` + `quality` concerns without the
 * "Cannot redefine plugin" dedupe dance the Nuxt layer needs. Layer it AFTER
 * the base/core concerns and BEFORE prettier:
 *
 *   import base from "@unraid/js-standards/eslint/base";
 *   import react from "@unraid/js-standards/eslint/react";
 *   export default [...base, ...react];
 */
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/** JSX/TSX component files — the only files the React rules apply to. */
const REACT_FILES = ["**/*.{jsx,tsx}"];

/**
 * Curated React + hooks rule set. Exported so it can be unit-tested (mirrors
 * the `vue` concern exporting `dataLoadingFetchRestrictions`).
 *
 * Errors are correctness/anti-slop bugs; warns are strong nudges that would be
 * too noisy to hard-gate on an existing codebase.
 */
export const reactRules = {
  // --- Modern-transform / TypeScript offs (see header)
  "react/react-in-jsx-scope": "off",
  "react/prop-types": "off",

  // --- Render correctness (real bugs)
  "react/jsx-key": "error", // missing key in a list → reconciliation bugs
  "react/no-unstable-nested-components": "error", // component defined mid-render remounts every render
  "react/jsx-no-target-blank": "error", // target="_blank" without rel="noreferrer" is a security hole
  "react/no-unknown-property": "error", // typo'd / non-DOM attributes silently dropped

  // --- Anti-slop nudges (warn)
  "react/no-array-index-key": "warn", // array index as key breaks on reorder/insert
  "react/jsx-no-useless-fragment": "warn", // <>{x}</> wrapping a single child
  "react/no-danger": "warn", // dangerouslySetInnerHTML — sanitize before using
  "react/self-closing-comp": "warn", // <div></div> → <div />
  "react/jsx-boolean-value": ["warn", "never"], // prefer <Comp disabled /> over disabled={true}

  // --- Hooks: the two rules that catch the classic hook footguns
  "react-hooks/rules-of-hooks": "error", // conditional / looped hook calls
  "react-hooks/exhaustive-deps": "warn", // stale-closure dependency arrays
};

export default [
  // Accessibility: spread jsx-a11y's recommended flat config, scoped to
  // component files. It brings its own `jsx-a11y` plugin registration, rules,
  // and `ecmaFeatures.jsx` languageOptions.
  {
    files: REACT_FILES,
    ...jsxA11y.flatConfigs.recommended,
  },
  // React + hooks: register the plugins, pin the React version (see the
  // "React-version note" in the header — `"detect"` crashes on ESLint 10), and
  // apply the curated rule set.
  {
    files: REACT_FILES,
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      // Needed so ESLint's default parser understands JSX in plain `.jsx`
      // files; harmless for `.tsx` (typescript-eslint accepts it).
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      // NB: `"detect"` throws on ESLint 10 (eslint-plugin-react 7.37.5 calls the
      // removed `context.getFilename()`); pin until a fixed plugin ships.
      react: { version: "19.0" },
    },
    rules: reactRules,
  },
  {
    // React component files are legitimately PascalCase (e.g. `Button.tsx`),
    // which the kebab-case default would flag. Mirrors how the `vue` concern
    // exempts `.vue` files.
    files: REACT_FILES,
    rules: {
      "unicorn/filename-case": "off",
    },
  },
];
