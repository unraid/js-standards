import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("the package exposes the fast Oxlint-first lint workflow", () => {
  const { scripts } = packageJson;

  assert.equal(scripts["lint:oxlint"], "oxlint");
  assert.match(scripts["lint:eslint"], /--cache/);
  assert.match(scripts["lint:eslint"], /--concurrency=auto/);
  assert.match(scripts["lint:eslint:full"], /eslint \./);
  assert.doesNotMatch(scripts["lint:eslint:full"], /--quiet/);
  assert.match(scripts["lint:eslint:stats"], /--stats/);
  assert.match(scripts["lint:eslint:stats"], /--format json/);
  assert.match(scripts["lint:eslint:stats"], /--concurrency=auto/);
  assert.match(scripts.lint, /lint:oxlint/);
  assert.match(scripts.lint, /lint:eslint/);
});
