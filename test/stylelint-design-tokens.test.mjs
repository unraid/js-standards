import { test } from "node:test";
import assert from "node:assert/strict";
import stylelint from "stylelint";

import baseConfig from "../src/stylelint/base.js";
import designTokens from "../src/stylelint/design-tokens.js";

// Lint a CSS string against a config and return the flat list of rule names that
// fired. `stylelint.lint` never throws on lint violations — it reports them as
// warnings — so a config that silently matched nothing and a config that matched
// everything are told apart by inspecting these rules, not by a thrown error.
async function rulesTriggered(code, config) {
  const { results } = await stylelint.lint({ code, config });
  return results.flatMap((result) =>
    result.warnings.map((warning) => warning.rule),
  );
}

test("design-tokens flags a hex color literal", async () => {
  const rules = await rulesTriggered("a { color: #fff; }", designTokens);
  assert.ok(
    rules.includes("color-no-hex"),
    `expected color-no-hex, got ${rules.join(", ")}`,
  );
});

test("design-tokens flags a hex color hidden in a var() fallback", async () => {
  // The exact shape that motivated this rule: a raw literal smuggled in as the
  // fallback of a token reference, which renders the literal when the token is
  // missing instead of failing visibly.
  const rules = await rulesTriggered(
    "a { color: var(--brand, #abc123); }",
    designTokens,
  );
  assert.ok(
    rules.includes("color-no-hex"),
    `expected color-no-hex, got ${rules.join(", ")}`,
  );
});

test("design-tokens flags a named color", async () => {
  const rules = await rulesTriggered("a { color: red; }", designTokens);
  assert.ok(
    rules.includes("color-named"),
    `expected color-named, got ${rules.join(", ")}`,
  );
});

test("design-tokens flags raw color functions (rgb + oklch)", async () => {
  const rgb = await rulesTriggered("a { color: rgb(0 0 0); }", designTokens);
  assert.ok(
    rgb.includes("function-disallowed-list"),
    `rgb: got ${rgb.join(", ")}`,
  );

  const oklch = await rulesTriggered(
    "a { color: oklch(0.5 0.1 200); }",
    designTokens,
  );
  assert.ok(
    oklch.includes("function-disallowed-list"),
    `oklch: got ${oklch.join(", ")}`,
  );
});

test("design-tokens allows a plain token reference", async () => {
  const rules = await rulesTriggered(
    "a { color: var(--color-primary); }",
    designTokens,
  );
  assert.deepEqual(rules, [], `expected no warnings, got ${rules.join(", ")}`);
});

test("design-tokens allows currentColor, transparent, and color-mix over tokens", async () => {
  const code = [
    "a { border-color: currentColor; }",
    "b { background: transparent; }",
    "c { color: color-mix(in oklch, var(--a), var(--b)); }",
  ].join("\n");
  const rules = await rulesTriggered(code, designTokens);
  assert.deepEqual(rules, [], `expected no warnings, got ${rules.join(", ")}`);
});

test("base does not forbid raw colors, so token-source files lint clean", async () => {
  // The baseline is safe on the files that DEFINE tokens, which legitimately
  // hold raw color values.
  const rules = await rulesTriggered(
    ":root { --color-primary: #3b82f6; }",
    baseConfig,
  );
  assert.ok(
    !rules.includes("color-no-hex"),
    `base should not flag hex in token sources, got ${rules.join(", ")}`,
  );
});
