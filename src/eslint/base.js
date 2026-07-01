/**
 * Public preset: base — framework-agnostic full stack.
 *
 * ignores + typescript + quality + testing, then prettier last. For plain TS
 * libraries and Node packages with no Vue and no Workers runtime.
 *
 * Compose concerns directly instead if you want finer control:
 *   import typescript from "@unraid/js-standards/eslint/typescript";
 *   import quality    from "@unraid/js-standards/eslint/quality";
 */
import prettier from "eslint-config-prettier";
import core from "./core.js";

export default [...core, prettier];
