import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { ESLint, Linter } from "eslint";
import nuxt from "../src/eslint/nuxt.js";
import quality from "../src/eslint/quality.js";

const linter = new Linter();
const filenameMessages = (filename) =>
  linter
    .verify(
      "export const value = 1;",
      [{ files: ["**/*.{js,mjs,ts,tsx,jsx}"] }, ...quality],
      { filename: path.resolve(filename) },
    )
    .filter(({ ruleId }) => ruleId === "unicorn/filename-case");

test("ordinary modules and test names use camelCase", () => {
  for (const filename of [
    "themeUtils.js",
    "themeUtils.test.ts",
    "themeUtils.spec.mjs",
    "eslint.config.mjs",
    "index.ts",
  ]) {
    assert.deepEqual(filenameMessages(filename), [], filename);
  }
  for (const filename of [
    "theme_utils.js",
    "theme-utils.ts",
    "ThemeUtils.js",
    "theme_utils.test.ts",
  ]) {
    assert.equal(filenameMessages(filename).length, 1, filename);
  }
});

test("component modules accept PascalCase and camelCase", () => {
  for (const filename of [
    "ThemePicker.jsx",
    "ThemePicker.tsx",
    "useTheme.tsx",
  ]) {
    assert.deepEqual(filenameMessages(filename), [], filename);
  }
  assert.equal(filenameMessages("theme-picker.tsx").length, 1);
});

test("package and route directory spelling does not affect module filenames", () => {
  assert.deepEqual(
    filenameMessages("priv/plugins/community-apps/assets/js/themeUtils.js"),
    [],
  );
});

test("Nuxt preserves route names while enforcing ordinary module names", async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: nuxt });
  for (const filename of [
    "pages/user-profile.vue",
    "server/api/user-profile.get.ts",
    "server/routes/user-profile.get.ts",
    "components/ThemePicker.vue",
  ]) {
    const config = await eslint.calculateConfigForFile(filename);
    assert.equal(config.rules["unicorn/filename-case"][0], 0, filename);
  }
  const config = await eslint.calculateConfigForFile("utils/theme_utils.ts");
  assert.equal(config.rules["unicorn/filename-case"][0], 2);
});
