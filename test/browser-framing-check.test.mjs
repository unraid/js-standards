import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import globals from "globals";
import unicorn from "eslint-plugin-unicorn";

import quality from "../src/eslint/quality.js";

// Guards that the canonical browser framing check stays spellable.
//
// `window.parent === window` is how DOM code asks "am I in an iframe?" before
// posting to a host. Under the upstream unicorn recommended set every rewrite
// is rejected by some other shipped rule (see the comment on
// `unicorn/prefer-global-this` in src/eslint/quality.js), so the check has no
// valid spelling and consumers reach for a suppression or an `as unknown as
// Window` bridge. We ship `prefer-global-this` off to keep it writable.

const linter = new Linter();

const configWithRuleOn = {
  languageOptions: { globals: globals.browser },
  plugins: { unicorn },
  rules: {
    "unicorn/prefer-global-this": "error",
    "unicorn/no-unnecessary-global-this": "error",
  },
};

const FRAMING_CHECK = `const isTopLevel = window.parent === window;\n`;

test("upstream unicorn rejects the window-based framing check", () => {
  const messages = linter.verify(FRAMING_CHECK, configWithRuleOn, "frame.js");
  const ruleIds = messages.map((message) => message.ruleId);

  assert.ok(
    ruleIds.includes("unicorn/prefer-global-this"),
    `expected prefer-global-this to fire upstream, got: ${ruleIds.join(", ") || "none"}`,
  );
});

test("shipped quality concern turns prefer-global-this off", () => {
  assert.equal(
    resolve("unicorn/prefer-global-this"),
    "off",
    "unicorn/prefer-global-this must stay off — see the comment in quality.js",
  );
});

/** Last-wins lookup of a rule across the concern's flat-config entries. */
const resolve = (ruleId) =>
  quality.findLast((entry) => entry.rules?.[ruleId] !== undefined)?.rules[
    ruleId
  ];

test("the useful half of the pair is kept", () => {
  // `globalThis.parent` must still trim to `parent` for plain member access.
  assert.equal(resolve("unicorn/no-unnecessary-global-this"), "error");

  // Documents the contradiction this change resolves: `prefer-global-this`
  // demands `globalThis`, while `sonarjs/no-global-this` forbids it. With
  // `prefer-global-this` off, the pair is consistent again.
  assert.equal(resolve("sonarjs/no-global-this"), "error");
  assert.equal(resolve("unicorn/prefer-global-this"), "off");
});
