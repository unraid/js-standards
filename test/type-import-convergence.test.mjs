import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";

// Regression guard for the three-rule type-import conflict. When a module
// exports both a value and types, `import-x/no-duplicates` wants a single
// merged statement while the old `prefer-top-level` /
// `separate-type-imports` settings wanted a distinct `import type` statement.
// The autofixers then oscillated and left an unfixable error. Pinning all
// three rules to the inline style makes a single `--fix` reach a stable,
// error-free fixed point.

const linter = new Linter();

const config = {
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  },
  plugins: { "@typescript-eslint": tseslint.plugin, "import-x": importX },
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "import-x/no-duplicates": ["error", { "prefer-inline": true }],
    "import-x/consistent-type-specifier-style": ["error", "prefer-inline"],
  },
};

// The store-memory.ts shape: a value import that also carries an inline type,
// plus a separate `import type` from the same module.
const CONFLICT_SOURCE = [
  `import { SETTINGS_KEYS, type AppfeedBuild } from "./store";`,
  `import type { AppfeedSettings } from "./store";`,
  `const key = SETTINGS_KEYS.a;`,
  `const build: AppfeedBuild = {};`,
  `const settings: AppfeedSettings = {};`,
  ``,
].join("\n");

test("type-import rules converge on a single --fix pass", () => {
  const { output, fixed, messages } = linter.verifyAndFix(
    CONFLICT_SOURCE,
    config,
  );

  assert.ok(fixed, "expected fixes to be applied");
  assert.equal(
    messages.length,
    0,
    `expected no unfixable messages, got: ${JSON.stringify(messages)}`,
  );

  // Both source lines collapse into one merged, inline-typed import.
  const importLines = output
    .split("\n")
    .filter((line) => line.includes("./store"));
  assert.equal(
    importLines.length,
    1,
    `expected a single merged import, got:\n${output}`,
  );
  assert.match(importLines[0], /type AppfeedBuild/);
  assert.match(importLines[0], /type AppfeedSettings/);
  assert.doesNotMatch(
    importLines[0],
    /^import type/,
    "SETTINGS_KEYS is a value, so the merged statement must stay a value import",
  );
});

test("the fixed output is stable (no further reports)", () => {
  const { output } = linter.verifyAndFix(CONFLICT_SOURCE, config);
  const secondPass = linter.verify(output, config);
  assert.equal(
    secondPass.length,
    0,
    `re-linting the fixed output must be clean, got: ${JSON.stringify(secondPass)}`,
  );
});
