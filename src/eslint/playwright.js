/**
 * Concern: Playwright. Two halves — the specs and the config that runs them.
 *
 * Specs get `eslint-plugin-playwright`'s recommended set (conditional logic in
 * tests, forgotten `await` on assertions, `page.waitForTimeout` sleeps, skipped
 * or focused tests left behind) plus a curated tier the plugin ships but leaves
 * out of recommended.
 *
 * The config half exists because Playwright defaults `actionTimeout` and
 * `navigationTimeout` to 0, meaning "no timeout" rather than a sensible one.
 * `expect()` has its own default, so a config that sets `expect.timeout` looks
 * bounded — but that ceiling only covers assertions. A bare `.click()` or
 * `.goto()` on an element that never becomes actionable waits out the whole test
 * budget, which on a long-running suite is a silent blackout: no output, no
 * failing assertion, and a final error naming the test rather than the call that
 * hung.
 */
import playwright from "eslint-plugin-playwright";

import { PLAYWRIGHT_CONFIG_FILES, PLAYWRIGHT_SPEC_FILES } from "./globs.js";

const REQUIRED_TIMEOUTS = ["actionTimeout", "navigationTimeout"];

/** Reads a static property name, ignoring spreads and computed keys. */
function propertyName(node) {
  if (node.type !== "Property" || node.computed) return null;
  if (node.key.type === "Identifier") return node.key.name;
  if (node.key.type === "Literal") return String(node.key.value);
  return null;
}

/** Finds a direct property of an object expression by name. */
function findProperty(objectExpression, name) {
  return objectExpression.properties.find(
    (property) => propertyName(property) === name,
  );
}

/**
 * Unwraps the config object from `defineConfig({...})`, `export default {...}`,
 * or a `satisfies`/`as` wrapper, so the rule reads the same shape either way.
 */
function configObject(node) {
  let current = node;
  while (current) {
    if (
      current.type === "TSSatisfiesExpression" ||
      current.type === "TSAsExpression"
    ) {
      current = current.expression;
      continue;
    }
    if (
      current.type === "CallExpression" &&
      current.callee.type === "Identifier" &&
      current.callee.name === "defineConfig" &&
      current.arguments.length > 0
    ) {
      current = current.arguments[0];
      continue;
    }
    return current.type === "ObjectExpression" ? current : null;
  }
  return null;
}

const requireActionTimeouts = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require explicit actionTimeout and navigationTimeout in a Playwright config",
    },
    schema: [],
    messages: {
      missing:
        "Playwright config does not set `{{name}}` in `use`. It defaults to 0 (no timeout), so a locator action on an element that never appears hangs for the entire test timeout instead of failing fast and naming the locator.",
    },
  },
  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        const config = configObject(node.declaration);
        if (!config) return;

        const useProperty = findProperty(config, "use");
        // A config with no `use` block at all still inherits both defaults, so
        // report against the config object rather than skipping it.
        const target =
          useProperty && useProperty.value.type === "ObjectExpression"
            ? useProperty.value
            : null;

        for (const name of REQUIRED_TIMEOUTS) {
          if (target && findProperty(target, name)) continue;
          context.report({
            node: target ?? config,
            messageId: "missing",
            data: { name },
          });
        }
      },
    };
  },
};

const configPlugin = {
  meta: { name: "playwright-config" },
  rules: { "require-action-timeouts": requireActionTimeouts },
};

const recommended = playwright.configs["flat/recommended"];

/**
 * Rules the plugin ships but leaves out of recommended.
 *
 * These are `error` on purpose. This package is the bar new work is written
 * against, so the standard states the target rather than the current state of
 * any one suite; a repo adopting mid-stream downgrades specific rules in its own
 * config, which keeps the exception visible and local instead of hidden in the
 * shared baseline.
 *
 * Left off deliberately, as pure convention rather than correctness:
 * `prefer-lowercase-title` (style), `require-tags` and `no-restricted-*` (need a
 * project-specific vocabulary), `require-soft-assertions` (changes failure
 * semantics), `max-expects` (an arbitrary budget), and `no-hooks` (directly
 * contradicts `require-hook` below).
 */
const CURATED_SPEC_RULES = {
  // Matcher choice is diagnostic quality: `toBe(true)` reports "expected true,
  // received false", while `toBeTruthy()` reports almost nothing useful.
  "playwright/prefer-to-be": "error",
  "playwright/prefer-to-contain": "error",
  "playwright/prefer-comparison-matcher": "error",
  "playwright/prefer-equality-matcher": "error",
  "playwright/prefer-strict-equal": "error",
  "playwright/require-to-throw-message": "error",
  // An unbounded `toPass` is the same silent-blackout shape as an unbounded
  // action: it retries until the test budget runs out.
  "playwright/require-to-pass-timeout": "error",
  "playwright/no-commented-out-tests": "error",
  // Locator quality. A CSS or nth-based selector binds the test to markup
  // structure, so it breaks on a refactor that changed nothing a user can see,
  // and it reports "element not found" rather than naming the control.
  "playwright/prefer-native-locators": "error",
  "playwright/no-nth-methods": "error",
  "playwright/no-raw-locators": "error",
  "playwright/no-get-by-title": "error",
  // Structure: shared setup belongs in a hook, and a spec should declare what it
  // covers. `test.slow()` triples a budget instead of fixing what is slow.
  "playwright/require-hook": "error",
  "playwright/require-top-level-describe": "error",
  "playwright/no-slowed-test": "error",
};

export default [
  {
    ...recommended,
    files: PLAYWRIGHT_SPEC_FILES,
    rules: { ...recommended.rules, ...CURATED_SPEC_RULES },
  },
  {
    files: PLAYWRIGHT_CONFIG_FILES,
    plugins: { "playwright-config": configPlugin },
    rules: { "playwright-config/require-action-timeouts": "error" },
  },
];
