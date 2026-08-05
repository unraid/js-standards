import assert from "node:assert/strict";
import { test } from "node:test";

import { Linter } from "eslint";

import playwrightConcern from "../src/eslint/playwright.js";

const linter = new Linter();
const concern = playwrightConcern.find(
  (entry) => entry.plugins?.["limetech-playwright"],
);
const ruleName = "limetech-playwright/prefer-stable-action-locator";

const lint = (source) =>
  linter.verify(source, {
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: concern.plugins,
    rules: { [ruleName]: "error" },
  });

const assertFlagged = (source) => {
  const messages = lint(source);
  assert.equal(messages.length, 1, JSON.stringify(messages));
  assert.equal(messages[0].ruleId, ruleName);
};

test("flags static copy locators used for actions", () => {
  const sources = [
    `await page.getByText("Save").click();`,
    `await page.getByLabel("Email").fill("user@example.com");`,
    `await page.getByPlaceholder(/search/i).press("Enter");`,
    `await page.getByRole("button", { name: "Save" }).click();`,
    `await page.getByTestId("row").filter({ hasText: "Starter" }).click();`,
    `await page.getByText("Save").filter({ visible: true }).first().click();`,
    `const saveButton = page.getByText("Save"); await saveButton.click();`,
  ];
  assert.equal(sources.length, 7);
  for (const source of sources) {
    assertFlagged(source);
  }
});

test("allows stable action locators and dynamic scenario data", () => {
  for (const source of [
    `await page.getByTestId("save-account").click();`,
    `await page.getByRole("dialog").focus();`,
    `await page.getByRole("button", { name: buttonName }).click();`,
    `await page.getByText(productName).click();`,
  ]) {
    assert.deepEqual(lint(source), []);
  }
});

test("allows copy locators when verifying UI text and accessibility", () => {
  for (const source of [
    `await expect(page.getByText("Saved")).toBeVisible();`,
    `await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();`,
    `const count = await page.getByText("Starter").count();`,
  ]) {
    assert.deepEqual(lint(source), []);
  }
});

test("stays opt-in so existing consumers are not red-walled", () => {
  assert.equal(concern.rules?.[ruleName], undefined);
  assert.ok(concern.plugins?.["limetech-playwright"]);
});
