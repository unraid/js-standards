/**
 * Concern: code quality. Framework-agnostic. The rules that catch low-quality
 * and error-prone patterns, split by intent below:
 *
 *   - correctness footguns        (eqeqeq, no-console, no-nested-ternary…)
 *   - redundant comments          (deslop, no-warning-comments)
 *   - eslint-disable abuse        (@eslint-community/eslint-comments)
 *   - complexity / size budgets   (warn + ratchet — you can't refactor a
 *                                  backlog at once; gate new code first)
 *   - duplication                 (sonarjs — catches copy-paste)
 *   - import hygiene              (syntactic import-x rules; tsc owns resolution)
 *
 * Pure-opinion / stack-hostile rules (unicorn name/abbreviation nagging, etc.)
 * are explicitly disabled so the signal-to-noise stays high.
 */
import js from "@eslint/js";
import globals from "globals";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import importX from "eslint-plugin-import-x";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import deslop from "eslint-plugin-deslop";

export default [
  js.configs.recommended,
  unicorn.configs.recommended,
  sonarjs.configs.recommended,
  comments.recommended,
  {
    plugins: { deslop, "import-x": importX },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // --- Correctness footguns
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-nested-ternary": "error",
      "no-param-reassign": "error",

      // --- Redundant comments that just restate the code (heuristic → warn)
      "deslop/no-obvious-comments": "warn",
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme", "xxx", "hack", "placeholder"],
          location: "anywhere",
        },
      ],

      // --- Blanket eslint-disable abuse (silencing rules instead of fixing)
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/no-unused-disable": "error",
      "@eslint-community/eslint-comments/require-description": [
        "error",
        { ignore: ["eslint-enable"] },
      ],

      // --- Complexity / size budgets: warn + ratchet (gate new code, don't
      //     red-wall the existing backlog). Once a repo is under budget,
      //     append the "eslint/strict-size" fragment to promote the two
      //     size rules to "error"; complexity stays warn by design.
      complexity: ["warn", { max: 12 }],
      "max-depth": ["warn", 4],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 4],
      "max-lines": [
        "warn",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      // Two-tier function length: warn at 50 (ESLint's default, the "fits on
      // a screen" nudge most teams consider healthy); the strict-size
      // fragment hard-errors at the 80-line runaway ceiling.
      "max-lines-per-function": [
        "warn",
        { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      "sonarjs/cognitive-complexity": ["warn", 15],

      // --- Duplication (catches copy-paste)
      "sonarjs/no-duplicate-string": ["error", { threshold: 4 }],
      "sonarjs/no-identical-functions": "error",

      // --- Import hygiene: only syntactic rules (no resolver → no false
      //     positives on Nuxt aliases / Workers virtual modules). Cycle
      //     detection is left to dependency-cruiser.
      //
      //     `no-duplicates` (default) + `consistent-type-specifier-style:
      //     prefer-top-level` + `consistent-type-imports` (separate) already
      //     converge under a single `eslint --fix`: a value + type import from
      //     one module fix to `import { value } from "m"` plus a separate
      //     `import type { … } from "m"`, which `no-duplicates` does NOT flag
      //     (pure value + pure type-only are allowed). The apparent "conflict"
      //     was a half-fixed file inspected without running the fixer to a fixed
      //     point — see test/type-import-convergence.test.mjs.
      "import-x/no-duplicates": "error",
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import-x/no-mutable-exports": "error",

      // --- Unicorn: keep the sharp rules, silence the pure-opinion nagging
      //     that fights domain naming and our stack.
      "unicorn/prevent-abbreviations": "off",
      "unicorn/name-replacements": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/no-useless-undefined": "off",

      // --- Unicorn: modernization rule that outruns our runtime. The
      //     suggested API isn't shipped on our Node target yet, so its
      //     autofix rewrites working code into a call that compiles but
      //     THROWS at runtime. `Uint8Array#toBase64()`/`fromBase64()` are
      //     still TC39 Stage-3 and absent on Node 24 (the property is
      //     `undefined`), so `Buffer.from(x).toString("base64")` stays the
      //     only working call. Re-enable once the runtime ships them.
      "unicorn/prefer-uint8array-base64": "off",
    },
  },
];
