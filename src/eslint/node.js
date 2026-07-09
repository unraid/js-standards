/**
 * Public preset: node — plain Node.js service / AWS Lambda handler.
 *
 * core + Node runtime globals, prettier last. Unlike `worker`, it does NOT ban
 * Node builtins — Lambdas and Node services legitimately use `node:crypto`,
 * `node:fs`, `process`, `Buffer`, etc. Use for Lambda handlers, Node CLIs, and
 * build/tooling scripts.
 */
import globals from "globals";
import prettier from "eslint-config-prettier";
import core from "./core.js";

export default [
  ...core,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
];
