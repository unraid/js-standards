import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";

// Guards that the shipped type-import rules already converge under a single
// `eslint --fix` — no rule "fight". A value + type import from the same module
// fixes to `import { value } from "m"` + a separate `import type { … } from
// "m"`, which `no-duplicates` does NOT flag (pure value + pure type-only are
// allowed to coexist). A file that looks stuck is almost always a half-fixed
// state inspected without running the fixer to a fixed point.

const linter = new Linter();

// Mirror the shipped config for the three interacting rules.
const config = {
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  },
  plugins: { "@typescript-eslint": tseslint.plugin, "import-x": importX },
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "import-x/no-duplicates": "error",
    "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
  },
};

// A module that exports both a value and types, imported as a mixed
// value+inline-type statement plus a separate type import — the store shape.
const MIXED_SOURCE = [
  `import { VALUE, type Alpha } from "./mod";`,
  `import type { Beta } from "./mod";`,
  `const v = VALUE.x;`,
  `const a: Alpha = {};`,
  `const b: Beta = {};`,
  ``,
].join("\n");

test("mixed value+type imports converge on a single --fix pass", () => {
  const { output, fixed, messages } = linter.verifyAndFix(MIXED_SOURCE, config);

  assert.ok(fixed, "expected fixes to be applied");
  assert.equal(
    messages.length,
    0,
    `expected no unfixable messages, got: ${JSON.stringify(messages)}`,
  );

  const importLines = output
    .split("\n")
    .filter((line) => line.includes("./mod"));
  // Converges to a pure value import + one separate type-only import.
  assert.equal(
    importLines.length,
    2,
    `expected value + type-only imports, got:\n${output}`,
  );
  const valueLine = importLines.find((l) => !l.startsWith("import type"));
  const typeLine = importLines.find((l) => l.startsWith("import type"));
  assert.ok(valueLine && !/\btype\s/.test(valueLine), "value import stays pure");
  assert.match(typeLine, /Alpha/);
  assert.match(typeLine, /Beta/);
});

test("a pure value + type-only split is already clean (no-duplicates allows it)", () => {
  const source = [
    `import { VALUE } from "./mod";`,
    `import type { Alpha } from "./mod";`,
    `const v = VALUE.x;`,
    `const a: Alpha = {};`,
    ``,
  ].join("\n");
  const messages = linter.verify(source, config);
  assert.equal(
    messages.length,
    0,
    `pure split must be clean, got: ${JSON.stringify(messages)}`,
  );
});

test("the fixed output is stable (no further reports)", () => {
  const { output } = linter.verifyAndFix(MIXED_SOURCE, config);
  const secondPass = linter.verify(output, config);
  assert.equal(
    secondPass.length,
    0,
    `re-linting the fixed output must be clean, got: ${JSON.stringify(secondPass)}`,
  );
});
