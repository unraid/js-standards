/**
 * Opt-in: strict size budgets. Promotes the file- and function-length limits
 * from `warn` to `error` so oversized code fails CI instead of just nagging.
 *
 * Why a separate opt-in and not the default? These limits ship as `warn` in the
 * quality concern on purpose — a shared preset can't hard-gate every consuming
 * repo's existing backlog (you can't refactor a 900-line legacy file to land an
 * unrelated one-line fix). Once a repo is under budget, append this fragment to
 * lock it in:
 *
 *   import base       from "@unraid/js-standards/eslint/base";
 *   import strictSize from "@unraid/js-standards/eslint/strict-size";
 *
 *   export default [...base, ...strictSize];
 *
 * Scope note: only the two size rules are promoted. Cognitive/cyclomatic
 * complexity stays `warn` deliberately — hard-gating it rewards extracting
 * nonsense helpers to game the metric, which fragments cohesive logic and hurts
 * readability. Size is the budget where the metric and the goal actually align.
 *
 * Function length is intentionally two-tier: the quality concern *warns* at 50
 * (the "fits on a screen" nudge), and this fragment *errors* at 80 — a hard stop
 * for genuinely runaway functions without red-walling the 50–80 grey zone. A
 * function is harder to split than a file, so the error ceiling stays lenient to
 * avoid rewarding nonsense-helper extraction just to satisfy the linter.
 *
 * Files use one tier: warn and error both at 400 (splitting a file is mechanical
 * and almost always a real improvement). Override per-repo after this if needed.
 */
import { TOOLING_FILES } from "./globs.js";

export default [
	{
		rules: {
			"max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
			"max-lines-per-function": [
				"error",
				{ max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
			],
		},
	},
	{
		// Config / scripts legitimately run long — keep the quality concern's
		// tooling exception intact after promoting the budgets to error.
		files: TOOLING_FILES,
		rules: {
			"max-lines": "off",
			"max-lines-per-function": "off",
		},
	},
];
