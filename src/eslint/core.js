/**
 * Internal: the framework-agnostic core = ignores + typescript + anti-slop +
 * testing + tooling relaxations. NOT exported directly and deliberately does
 * NOT end with prettier — each public preset appends prettier last (after any
 * framework layer) so no formatting rules survive.
 */
import ignores from "./ignores.js";
import typescript from "./typescript.js";
import antiSlop from "./anti-slop.js";
import testing from "./testing.js";
import { TOOLING_FILES } from "./globs.js";

export default [
	...ignores,
	...typescript,
	...antiSlop,
	...testing,
	{
		files: TOOLING_FILES,
		rules: {
			"no-console": "off",
			"max-lines": "off",
			"max-lines-per-function": "off",
		},
	},
];
