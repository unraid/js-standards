import assert from "node:assert/strict";
import { test } from "node:test";

import { ESLint } from "eslint";

import nodePreset from "../src/eslint/node.js";

const eslint = new ESLint({
  cwd: process.cwd(),
  overrideConfig: nodePreset,
  overrideConfigFile: true,
});

const severity = (rule) => rule?.[0] ?? 0;

test("TypeScript extension rules replace overlapping core rules", async () => {
  const config = await eslint.calculateConfigForFile("fixture.ts");

  assert.equal(severity(config.rules["no-undef"]), 0);
  assert.equal(severity(config.rules["no-unused-vars"]), 0);
  assert.equal(severity(config.rules["@typescript-eslint/no-unused-vars"]), 2);
});

test("plain JavaScript keeps equivalent correctness coverage", async () => {
  const config = await eslint.calculateConfigForFile("fixture.js");

  assert.equal(severity(config.rules["no-undef"]), 2);
  assert.equal(severity(config.rules["no-unused-vars"]), 0);
  assert.equal(severity(config.rules["@typescript-eslint/no-unused-vars"]), 2);
});
