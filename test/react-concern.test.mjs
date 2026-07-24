import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRules } from "../src/eslint/react.js";

const linter = new Linter();

/** Lint a JSX snippet (array of lines) under the exported react rule set. */
const lintJsx = (lines) =>
  linter.verify(lines.join("\n"), {
    plugins: {
      "@eslint-react": eslintReact,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: reactRules,
  });

const ruleIds = (messages) => messages.map((m) => m.ruleId);

test("flags array index used as a key", () => {
  const messages = lintJsx([
    "const List = ({ items }) => (",
    "  <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>",
    ");",
  ]);
  assert.ok(
    ruleIds(messages).includes("@eslint-react/no-array-index-key"),
    `expected @eslint-react/no-array-index-key, got: ${JSON.stringify(messages)}`,
  );
});

test("allows a stable key from item id", () => {
  const messages = lintJsx([
    "const List = ({ items }) => (",
    "  <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>",
    ");",
  ]);
  const keyRuleIds = new Set([
    "@eslint-react/no-array-index-key",
    "@eslint-react/no-missing-key",
    "@eslint-react/no-duplicate-key",
  ]);
  const relevant = messages.filter((m) => keyRuleIds.has(m.ruleId));
  assert.equal(
    relevant.length,
    0,
    `expected no key-related report, got: ${JSON.stringify(relevant)}`,
  );
});

test("flags a hook called conditionally (rules-of-hooks)", () => {
  const messages = lintJsx([
    'import { useState } from "react";',
    "const Toggle = ({ on }) => {",
    "  if (on) {",
    "    const [value, setValue] = useState(0);",
    "    return <button onClick={() => setValue(value + 1)}>{value}</button>;",
    "  }",
    "  return null;",
    "};",
  ]);
  assert.ok(
    ruleIds(messages).includes("react-hooks/rules-of-hooks"),
    `expected react-hooks/rules-of-hooks, got: ${JSON.stringify(messages)}`,
  );
});
