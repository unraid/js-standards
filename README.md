# @unraid/js-standards

Lime Technology's shared JS/TS quality + **anti-slop** presets. One package, one
pinned toolchain, consumed by every LT JavaScript repo so AI-generated code is
held to the same aggressive bar everywhere.

Bundles and version-pins the whole stack (typescript-eslint, unicorn, sonarjs,
import-x, eslint-comments, deslop) so a consumer installs **one** dependency
instead of a dozen drifting ones.

## What's inside

The ESLint config is split into **composable concerns**. The three ready-made
presets (`base` / `nuxt` / `worker`) just stack the concerns in the right order
and append Prettier last; pull individual concerns when you want finer control.

**Presets (start here):**

| Export | = concerns | For |
| --- | --- | --- |
| `eslint/base` | ignores + typescript + anti-slop + testing | Plain TS libs / Node packages |
| `eslint/worker` | base + cloudflare-workers | Non-Nuxt Workers / services |
| `eslint/nuxt` | base + cloudflare-workers + vue + webGUI globals | Nuxt 4 apps on Workers |

**Concerns (compose your own):**

| Export | Concern |
| --- | --- |
| `eslint/typescript` | Type-safety — strict-type-checked + stylistic, unsafe-any / promise / nullish rules |
| `eslint/anti-slop` | Slop patterns — unicorn (tuned), sonarjs, eslint-comments, deslop, complexity/size budgets, duplication |
| `eslint/vue` | Vue 3 / Nuxt SFC parsing + auto-import awareness + team conventions |
| `eslint/cloudflare-workers` | Workers runtime globals + no-Node-builtin guards |
| `eslint/testing` | Spec/fixture relaxations |
| `eslint/ignores` | Shared build-artifact ignores |
| `eslint/globals` | Raw globals maps (Workers + webGUI) |

**Non-ESLint:**

| Export | Purpose |
| --- | --- |
| `prettier` | Shared Prettier config (single source of truth) |
| `tsconfig/base.json` / `nuxt.json` / `worker.json` | Extreme-strict tsconfig + framework variants |
| `knip/base` | Shared knip dead-code baseline |

### Severity tiers

Type-safety + correctness + duplication + eslint-disable-abuse rules are
`error`. **Complexity / size budgets are `warn`** — you can't refactor an
existing backlog in one PR, so gate new code first and flip to `error` per repo
once the baseline is under budget. Pure-opinion rules that fight domain naming
(`unicorn/name-replacements`, abbreviation nagging, etc.) are disabled outright.

## What the anti-slop rules catch

- **Type escapes** — `no-explicit-any`, `no-non-null-assertion`, unsafe `any`
  assignment/call/return (typescript-eslint `strict-type-checked`).
- **Async bugs** — floating & misused promises, needless `await` (the most
  common AI Worker bug).
- **Needless code** — `no-unnecessary-condition` flags the pointless guards AI
  loves to add; knip deletes orphaned files/exports/deps.
- **Sprawl** — complexity, cognitive-complexity, `max-lines`, `max-params`,
  nesting budgets force refactors instead of 300-line functions.
- **Copy-paste** — sonarjs duplicate-string / identical-functions.
- **Escape hatches** — `eslint-comments` bans blanket / undescribed
  `eslint-disable`.
- **Comment slop** — deslop flags comments that just restate the code.

## Usage

```js
// eslint.config.mjs
import unraid from "@unraid/js-standards/eslint/nuxt";

export default [
	...unraid,
	{
		// repo-specific overrides only
	},
];
```

```jsonc
// package.json
"prettier": "@unraid/js-standards/prettier"
```

```jsonc
// tsconfig.json
{ "extends": "@unraid/js-standards/tsconfig/nuxt.json" }
```

```js
// knip.config.js
import base from "@unraid/js-standards/knip/base";
export default { ...base, entry: [...base.entry, "server/index.ts"] };
```

Peer deps the consumer provides: `eslint >=10.4`, `typescript >=5.5`, and (for
the Nuxt preset) `@nuxt/eslint-config`.

## Gotchas

### `no-restricted-imports` cannot be merged

ESLint keeps only the **last** `no-restricted-imports` config for a given file —
two blocks don't merge. The `cloudflare-workers` concern already sets one (to
block Node builtins). If your repo needs its own restrictions too (e.g. banning
parent-relative imports), combine both into a **single** block rather than
adding a second one, or the concern's rule is silently overridden:

```js
{
	rules: {
		"no-restricted-imports": [
			"error",
			{
				paths: [
					{ name: "fs", message: "Not available on the Workers runtime." },
					// …the rest of the cloudflare-workers paths…
				],
				patterns: [
					{ group: ["../*"], message: "Use #aliases instead of parent-relative imports." },
				],
			},
		],
	},
}
```

### Deduping plugins when layering on `@nuxt/eslint-config`

The `nuxt`/`vue` presets pull Nuxt's bundled typescript-eslint / unicorn /
import-x. Combined with our `typescript` + `anti-slop` concerns that can produce
two copies of a plugin and ESLint throws *"Cannot redefine plugin"*. Pin them to
one version in the consumer:

```jsonc
// package.json → pnpm.overrides
"@typescript-eslint/eslint-plugin": "8.62.1",
"@typescript-eslint/parser": "8.62.1",
"@typescript-eslint/utils": "8.62.1",
"eslint-plugin-unicorn": "69.0.0",
"eslint-plugin-import-x": "4.17.1"
```

## Oxlint fast pre-pass

Oxlint (Rust) runs the syntactic subset **~300× faster** than the full ESLint
pass (measured on community-apps-worker: **0.4s vs 135s**), and it parses `.vue`
SFCs. Use it as a pre-pass for instant local feedback; keep ESLint authoritative
for type-aware + Vue-template + anti-slop rules Oxlint can't do.

**1. Consumer `.oxlintrc.json`** — extend the shared base. ⚠️ Oxlint does **not**
support npm-package specifiers in `extends` (only file paths), so point at the
installed file via its stable pnpm symlink path:

```jsonc
// .oxlintrc.json
{ "extends": ["./node_modules/@unraid/js-standards/src/oxlint/base.json"] }
```

**2. Dedupe ESLint** — append the oxlint concern last so ESLint skips what Oxlint
already checked:

```js
import unraid from "@unraid/js-standards/eslint/nuxt";
import oxlintDisable from "@unraid/js-standards/eslint/oxlint";

export default [
	...unraid,
	...oxlintDisable(), // must be last
];
```

**3. Wire the scripts** — Oxlint on pre-commit + first in CI; ESLint after:

```jsonc
"scripts": {
	"lint:fast": "oxlint",
	"lint": "oxlint && eslint .",
	"lint:fix": "oxlint --fix && eslint . --fix"
}
```

Run `oxlint` on pre-commit/pre-push for sub-second feedback; run the full `lint`
(both) in CI. Peer dep: `oxlint` (consumer installs it).

### Type-aware Oxlint (experimental, but fast)

Oxlint's `--type-aware` mode runs the semantic rules (unsafe-`any` family,
floating promises, `await-thenable`, `no-base-to-string`, …) on the Go
TypeScript compiler (`tsgo`) — measured on community-apps-worker at **~2.8s vs
ESLint's 135s** for the same class of checks, with **no monorepo crash**. Use the
`oxlint/type-aware` preset (= `oxlint/base` + the `pedantic` category):

```jsonc
// .oxlintrc.json
{ "extends": ["./node_modules/@unraid/js-standards/src/oxlint/type-aware.json"] }
```

```jsonc
// package.json — needs the Go backend as a devDep
"devDependencies": { "oxlint-tsgolint": "^0.24.0" },
"scripts": { "lint:types": "oxlint --type-aware" }
```

**Coverage vs typescript-eslint (as of oxlint 1.72 / tsgolint 0.24):** covers the
bulk of the type-safety rules, but **not yet** `no-unnecessary-condition` or
`no-misused-promises` — keep ESLint authoritative for those (plus Vue-template
and sonarjs/deslop rules) until they land. It's preview + pinned to a `tsgo` dev
build, so treat it as a fast **advisory** gate, not the merge blocker, for now.

## Why ESLint and not Biome / Oxlint (2026)

The faster Rust linters are real and worth using — but not as the *base* for our
stack:

- **Our repos are Nuxt/Vue.** Oxlint can't fully support `eslint-plugin-vue`
  (Vue uses its own compiler / modified AST, so many rules can't run against SFC
  templates), and Biome's Vue/Nuxt story is still thin. ESLint has the only
  mature Vue/Nuxt configs.
- **The anti-slop value lives in ESLint plugins.** unicorn, sonarjs, deslop, and
  eslint-comments have no Biome/Oxlint equivalent.
- **Type-aware rules are the core of this config.** typescript-eslint's
  strict-type-checked is fully mature; Oxlint's `tsgolint` type-aware mode is
  still preview with known memory/deadlock issues on large monorepos — and we
  are a monorepo.

**Planned optimization (not blocking):** add Oxlint as a fast *pre-pass*
(pre-commit + first CI step) for the syntactic rules it already covers — it's
50–100× faster and gives near-instant local feedback — with
`eslint-plugin-oxlint` turning off the ESLint rules Oxlint handles to avoid
double work. ESLint stays authoritative for type-aware + Vue + anti-slop. If
that pre-pass lands, it ships here as an `oxlint/base` export.

## Rollout guidance

New rules land **warn-first** for one minor, then flip to `error`. Pin an exact
version in consumers; let Renovate open the bump PR so its CI run is the test.

## Publishing

Currently `private` + GitHub Packages (`publishConfig.access: "restricted"`).
To go public later: set `"private": false`, `access: "public"`, drop the
`registry` override, and publish to npm.
