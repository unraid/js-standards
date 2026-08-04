import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import playwrightConfigConcern from "../src/eslint/playwright.js";

const linter = new Linter();
// Select by rule identity, not position — the concern also ships a spec-file
// entry, and which one comes first is not part of its contract.
const concern = playwrightConfigConcern.find(
  (entry) => entry.rules?.["playwright-config/require-action-timeouts"],
);

/** Lint a Playwright config body under the shipped concern's plugin and rules. */
const lintConfig = (source) =>
  linter.verify(source, {
    plugins: concern.plugins,
    rules: concern.rules,
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  });

const missingNames = (source) =>
  lintConfig(source)
    .map((message) => /`(\w+)`/.exec(message.message)?.[1])
    .filter(Boolean);

test("flags a config that sets neither timeout", () => {
  // The exact shape that motivated this rule: expect() carries a ceiling, so the
  // config looks bounded, while every bare .click() and .goto() is not.
  const source = `
    import { defineConfig } from "@playwright/test";
    export default defineConfig({
      timeout: 600000,
      expect: { timeout: 60000 },
      use: { baseURL: "http://localhost", viewport: { width: 1440, height: 900 } },
    });
  `;
  assert.deepEqual(
    missingNames(source).toSorted((left, right) => left.localeCompare(right)),
    ["actionTimeout", "navigationTimeout"],
  );
});

test("flags only the timeout that is absent", () => {
  const source = `
    import { defineConfig } from "@playwright/test";
    export default defineConfig({
      use: { actionTimeout: 15000 },
    });
  `;
  assert.deepEqual(missingNames(source), ["navigationTimeout"]);
});

test("accepts a config that sets both timeouts", () => {
  const source = `
    import { defineConfig } from "@playwright/test";
    export default defineConfig({
      use: { actionTimeout: 15000, navigationTimeout: 30000 },
    });
  `;
  assert.deepEqual(lintConfig(source), []);
});

test("flags a config with no use block, which still inherits both defaults", () => {
  const source = `
    import { defineConfig } from "@playwright/test";
    export default defineConfig({ timeout: 600000 });
  `;
  assert.equal(lintConfig(source).length, 2);
});

test("reads a plain default-exported object, not just defineConfig", () => {
  const source = `
    export default { use: { actionTimeout: 15000, navigationTimeout: 30000 } };
  `;
  assert.deepEqual(lintConfig(source), []);
});

test("ignores a module that exports something other than a config object", () => {
  assert.deepEqual(lintConfig(`export default function build() {}`), []);
});
