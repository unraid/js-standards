import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import playwrightConcern from "../src/eslint/playwright.js";

const linter = new Linter();
// The spec half is the entry that carries the upstream plugin's rules; the other
// entry lints config files. Select by identity rather than position.
const concern = playwrightConcern.find(
  (entry) => entry.rules?.["playwright/no-wait-for-timeout"],
);

const rulesTriggered = (source) =>
  linter
    .verify(source, {
      plugins: concern.plugins,
      rules: concern.rules,
      languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    })
    .map((message) => message.ruleId);

test("the recommended set is actually wired, not just declared", () => {
  assert.ok(
    Object.keys(concern.rules).length > 30,
    "expected the upstream recommended rules to be spread into the concern",
  );
});

test("flags a hard sleep, which is the usual cause of a flaky wait", () => {
  const rules = rulesTriggered(
    `test("x", async ({ page }) => { await page.waitForTimeout(1000); });`,
  );
  assert.ok(
    rules.includes("playwright/no-wait-for-timeout"),
    `got ${rules.join(", ")}`,
  );
});

test("flags a focused test, which silently skips the rest of the suite", () => {
  const rules = rulesTriggered(`test.only("x", async () => {});`);
  assert.ok(
    rules.includes("playwright/no-focused-test"),
    `got ${rules.join(", ")}`,
  );
});

test("flags an unbounded toPass, the same blackout shape as an unbounded action", () => {
  const rules = rulesTriggered(
    `test("x", async () => { await expect(async () => {}).toPass(); });`,
  );
  assert.ok(
    rules.includes("playwright/require-to-pass-timeout"),
    `got ${rules.join(", ")}`,
  );
});

test("flags a raw CSS locator, which binds the test to markup structure", () => {
  const rules = rulesTriggered(
    `test("x", async ({ page }) => { await page.locator(".thing").click(); });`,
  );
  assert.ok(
    rules.includes("playwright/no-raw-locators"),
    `got ${rules.join(", ")}`,
  );
});

test("keeps pure-convention rules off, so strictness stays about correctness", () => {
  // Pinned so a plugin upgrade cannot quietly switch them on.
  const enabled = new Set(Object.keys(concern.rules));
  for (const rule of [
    "playwright/prefer-lowercase-title",
    "playwright/require-tags",
    "playwright/require-soft-assertions",
    "playwright/max-expects",
    "playwright/no-hooks",
  ]) {
    assert.ok(!enabled.has(rule), `${rule} should stay off`);
  }
});
