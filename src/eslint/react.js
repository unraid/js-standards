/**
 * Concern: React (JSX / TSX) components + hooks + a11y.
 *
 * Layers React support onto the framework-agnostic core. It registers three
 * plugins — @eslint-react/eslint-plugin, eslint-plugin-react-hooks, and
 * eslint-plugin-jsx-a11y — and applies only to component files (`.jsx` and
 * `.tsx`), so a plain `.ts`/`.js` module never pays for the React rules.
 *
 * Plugin choice: we use `@eslint-react` (the "ESLint React (X)" toolkit) rather
 * than the classic `eslint-plugin-react`. @eslint-react is ESLint-10-native — it
 * declares `eslint: "*"` as its peer, is authored against the modern flat-config
 * + context API, and does NOT call the `context.getFilename()` method ESLint
 * removed in v10 (which is what made the classic plugin's `"detect"` version
 * probe crash on ESLint 10). No `settings.react.version` workaround is needed;
 * the curated rules below are AST-based and React-version-independent, so they
 * run on plain `.jsx` with no type information. @eslint-react bundles the DOM,
 * web-api, and naming-convention rule families under a single `@eslint-react/`
 * namespace (dash-separated ids, e.g. `@eslint-react/dom-no-unsafe-target-blank`).
 *
 * Rule philosophy: this is a CURATED set for "correct React UI patterns +
 * anti-slop", not @eslint-react's full `recommended` wall (which also turns on a
 * large legacy class-component / children-* / purity surface). We keep the rules
 * that catch real render bugs (missing/duplicate/unstable keys, components
 * declared inside render, dangerous target="_blank", unknown DOM props) and drop
 * the noisy, opinion-heavy ones. jsx-a11y's `recommended` flat config is spread
 * in whole, because accessibility defaults are worth having everywhere.
 *
 * Hooks note: @eslint-react ships its own `rules-of-hooks` / `exhaustive-deps`,
 * but we deliberately source those two from `eslint-plugin-react-hooks` (the
 * canonical React-team implementation, which already supports ESLint 10) and do
 * NOT enable @eslint-react's versions, so a hook footgun is reported once, not
 * twice.
 *
 * Parser note: `.tsx` is parsed by typescript-eslint via the `typescript`
 * concern (which claims `.tsx` with `projectService`). Plain `.jsx` is
 * parsed by ESLint's default parser, which needs
 * `languageOptions.parserOptions.ecmaFeatures.jsx = true` to understand JSX —
 * set below (jsx-a11y's recommended config also sets it, but we set it
 * explicitly so the concern is correct even if that changes upstream).
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
import eslintReact from "@eslint-react/eslint-plugin";
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
  // --- Render correctness (real bugs)
  "@eslint-react/no-missing-key": "error", // missing key in a list → reconciliation bugs
  "@eslint-react/no-duplicate-key": "error", // duplicate keys silently collide during reconciliation
  "@eslint-react/no-nested-component-definitions": "error", // component defined mid-render remounts every render
  "@eslint-react/dom-no-unsafe-target-blank": "error", // target="_blank" without rel="noreferrer" is a security hole
  "@eslint-react/dom-no-unknown-property": "error", // typo'd / non-DOM attributes silently dropped

  // --- Anti-slop nudges (warn)
  "@eslint-react/no-array-index-key": "warn", // array index as key breaks on reorder/insert
  "@eslint-react/jsx-no-useless-fragment": "warn", // <>{x}</> wrapping a single child
  "@eslint-react/dom-no-dangerously-set-innerhtml": "warn", // dangerouslySetInnerHTML — sanitize before using

  // --- Hooks: the two rules that catch the classic hook footguns. Sourced from
  // eslint-plugin-react-hooks (the React-team implementation); @eslint-react's
  // own equivalents are intentionally left off to avoid double-reporting.
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
  // React + hooks: register the plugins and apply the curated rule set. No
  // `settings.react.version` pin is needed — @eslint-react is ESLint-10-native
  // and these rules are React-version-independent (see the header).
  {
    files: REACT_FILES,
    plugins: {
      "@eslint-react": eslintReact,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      // Needed so ESLint's default parser understands JSX in plain `.jsx`
      // files; harmless for `.tsx` (typescript-eslint accepts it).
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
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
