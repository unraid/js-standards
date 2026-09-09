import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import vueParser from "vue-eslint-parser";
import { dataLoadingFetchRestrictions } from "../src/eslint/vue.js";

const linter = new Linter();

/** Lint a `<script setup>` body under the same rule the vue concern applies. */
const lintSetup = (scriptBody) =>
  linter.verify(
    `<script setup lang="ts">\n${scriptBody}\n</script>\n<template><div /></template>\n`,
    {
      languageOptions: {
        parser: vueParser,
        parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      },
      rules: {
        "no-restricted-syntax": ["error", ...dataLoadingFetchRestrictions],
      },
    },
  );

const flagged = [
  [
    "top-level await $fetch (const)",
    `const data = await $fetch("/api/thing");`,
  ],
  ["top-level await $fetch (statement)", `await $fetch("/api/thing");`],
  [
    "$fetch in onMounted",
    `onMounted(async () => {\n\tconst x = await $fetch("/api/thing");\n\treturn x;\n});`,
  ],
  [
    "$fetch in onServerPrefetch",
    `onServerPrefetch(async () => {\n\tawait $fetch("/api/thing");\n});`,
  ],
];

const allowed = [
  ["useFetch", `const { data } = await useFetch("/api/thing");`],
  [
    "useAsyncData wrapping $fetch",
    `const { data } = await useAsyncData("k", () => $fetch("/api/x"));`,
  ],
  [
    "$fetch in a mutation handler",
    `const save = async () => {\n\tawait $fetch("/api/save", { method: "POST" });\n};`,
  ],
  [
    "$fetch in a click-triggered loader",
    `const load = async () => {\n\tconst impact = await $fetch("/api/impact");\n\treturn impact;\n};`,
  ],
];

for (const [name, body] of flagged) {
  test(`flags data-loading $fetch: ${name}`, () => {
    const messages = lintSetup(body);
    const restricted = messages.filter(
      (m) => m.ruleId === "no-restricted-syntax",
    );
    assert.ok(
      restricted.length > 0,
      `expected a no-restricted-syntax report, got: ${JSON.stringify(messages)}`,
    );
    assert.match(restricted[0].message, /useFetch\(\)\/useAsyncData\(\)/);
  });
}

for (const [name, body] of allowed) {
  test(`allows $fetch: ${name}`, () => {
    const messages = lintSetup(body);
    const restricted = messages.filter(
      (m) => m.ruleId === "no-restricted-syntax",
    );
    assert.equal(
      restricted.length,
      0,
      `expected no report, got: ${JSON.stringify(restricted)}`,
    );
  });
}
