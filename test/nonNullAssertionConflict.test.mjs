import { test } from "node:test";
import assert from "node:assert/strict";
import { ESLint } from "eslint";
import typescriptConcern from "../src/eslint/typescript.js";
import testingConcern from "../src/eslint/testing.js";

// Guards that the shipped config never enables both halves of a contradiction.
//
// `no-non-null-assertion` bans `x!`. `non-nullable-type-assertion-style` (from
// stylisticTypeChecked) exists only to rewrite `x as T` into `x!`. With both on
// there is no valid shape for a non-null narrowing: `eslint --fix` rewrites
// `as T` to `!`, and re-linting that fixed output reports an unfixable
// `Forbidden non-null assertion`. Observed in unraid-e2e:
//
//   const value = map.get(key) as string;   // -> "Use a ! assertion ..."
//   const value = map.get(key)!;            // -> "Forbidden non-null assertion"
//
// non-nullable-type-assertion-style is type-aware, so it cannot be exercised by
// a program-less Linter run the way type-import convergence is. The invariant is
// asserted on the resolved config instead — via ESLint's own resolver, because
// these concerns scope rules by `files` (the JS block disables the type-aware
// rules wholesale) and a hand-rolled last-wins lookup reads the wrong block.

const BAN = "@typescript-eslint/no-non-null-assertion";
const DEMAND = "@typescript-eslint/non-nullable-type-assertion-style";

async function rulesFor(concern, filePath) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: concern,
  });
  const config = await eslint.calculateConfigForFile(filePath);
  return config.rules ?? {};
}

const severityOf = (setting) => (Array.isArray(setting) ? setting[0] : setting);
const isOff = (setting) =>
  setting === undefined ||
  severityOf(setting) === "off" ||
  severityOf(setting) === 0;
const isEnabled = (setting) => setting !== undefined && !isOff(setting);

test("the TypeScript concern bans `!` and drops the rule that demands it", async () => {
  const rules = await rulesFor(typescriptConcern, "src/example.ts");

  assert.ok(
    isEnabled(rules[BAN]),
    `expected ${BAN} to stay enabled for TS, got: ${JSON.stringify(rules[BAN])}`,
  );
  assert.ok(
    isOff(rules[DEMAND]),
    `${DEMAND} must be off wherever ${BAN} is enabled, got: ${JSON.stringify(rules[DEMAND])}`,
  );
});

test("the testing concern permits `!`, so the stylistic rule stays coherent", async () => {
  // Tests re-enable `!`, which makes "prefer ! over as" actionable again there.
  const rules = await rulesFor(testingConcern, "src/example.test.ts");
  assert.ok(
    isOff(rules[BAN]),
    `expected ${BAN} to be relaxed for tests, got: ${JSON.stringify(rules[BAN])}`,
  );
});

test("no resolved file type enables both halves of the contradiction", async () => {
  for (const filePath of [
    "src/example.ts",
    "src/example.tsx",
    "src/example.js",
  ]) {
    const rules = await rulesFor(typescriptConcern, filePath);
    assert.ok(
      !(isEnabled(rules[BAN]) && isEnabled(rules[DEMAND])),
      `${filePath} enables both ${BAN} and ${DEMAND}, which cannot both be satisfied`,
    );
  }
});
