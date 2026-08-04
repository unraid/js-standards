/**
 * Concern: Playwright configuration.
 *
 * Playwright defaults `actionTimeout` and `navigationTimeout` to 0, which means
 * "no timeout" rather than "a sensible one". A locator action on an element that
 * never becomes actionable therefore waits for the whole test timeout. On a suite
 * with a generous per-test budget that is a silent multi-minute blackout: no
 * output, no failing assertion, and a final error that names the test rather than
 * the click that hung. `expect()` has its own default and does not cover this —
 * only assertions get that ceiling, never a bare `.click()` or `.goto()`.
 *
 * Setting both explicitly turns that blackout into a fast failure naming the
 * exact locator.
 */
import { PLAYWRIGHT_CONFIG_FILES } from "./globs.js";

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

const plugin = {
  meta: { name: "playwright-config" },
  rules: { "require-action-timeouts": requireActionTimeouts },
};

export default [
  {
    files: PLAYWRIGHT_CONFIG_FILES,
    plugins: { "playwright-config": plugin },
    rules: { "playwright-config/require-action-timeouts": "error" },
  },
];
