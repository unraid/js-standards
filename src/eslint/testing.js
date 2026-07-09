/**
 * Concern: tests. Keeps type-safety on, but relaxes the size/duplication/assert
 * rules that fire constantly (and pointlessly) in specs and fixtures.
 */
import { TEST_FILES } from "./globs.js";

export default [
  {
    files: TEST_FILES,
    rules: {
      "no-console": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-identical-functions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
];
