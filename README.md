# @unraid/js-standards

Lime Technology's shared JS/TS **code-quality** presets. One package, one pinned
toolchain, consumed by every LT JavaScript repo so all code is held to the same
aggressive bar everywhere.

Bundles and version-pins the whole stack (typescript-eslint, unicorn, sonarjs,
import-x, eslint-comments, deslop) so a consumer installs **one** dependency
instead of a dozen drifting ones.

## What's inside

The ESLint config is split into **composable concerns**. The three ready-made
presets (`base` / `nuxt` / `worker`) just stack the concerns in the right order
and append Prettier last; pull individual concerns when you want finer control.

**Presets (start here):**

| Export          | = concerns                                            | For                                        |
| --------------- | ----------------------------------------------------- | ------------------------------------------ |
| `eslint/base`   | ignores + typescript + quality + testing              | Plain TS libs / Node packages              |
| `eslint/worker` | base + cloudflare-workers                             | Non-Nuxt Workers / services                |
| `eslint/node`   | base + Node runtime globals (no Workers builtin bans) | AWS Lambda handlers / Node services & CLIs |
| `eslint/nuxt`   | base + cloudflare-workers + vue + webGUI globals      | Nuxt 4 apps on Workers                     |

**Concerns (compose your own):**

| Export                      | Concern                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `eslint/typescript`         | Type-safety — strict-type-checked + stylistic, unsafe-any / promise / nullish rules                                                  |
| `eslint/quality`            | Quality patterns — unicorn (tuned), sonarjs, eslint-comments, deslop, complexity/size budgets, duplication                           |
| `eslint/vue`                | Vue 3 / Nuxt SFC parsing + auto-import awareness + team conventions                                                                  |
| `eslint/cloudflare-workers` | Workers runtime globals + no-Node-builtin guards                                                                                     |
| `eslint/testing`            | Spec/fixture relaxations                                                                                                             |
| `eslint/strict-size`        | Opt-in: promotes `max-lines` + `max-lines-per-function` from `warn` to `error` (append after a preset once the repo is under budget) |
| `eslint/ignores`            | Shared build-artifact ignores                                                                                                        |
| `eslint/globals`            | Raw globals maps (Workers + webGUI)                                                                                                  |

**Non-ESLint:**

| Export                                                           | Purpose                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `prettier`                                                       | Shared Prettier config for JS/TS, JSON, Markdown, CSS, and SCSS (single source of truth)                                              |
| `tsconfig/base.json` / `nuxt.json` / `worker.json` / `node.json` | Extreme-strict tsconfig + framework variants (`node.json` = ES2022 + Bundler resolution + `@types/node`, for esbuild-bundled Lambdas) |
| `knip/base`                                                      | Shared knip dead-code baseline                                                                                                        |
| `stylelint/base`                                                 | Shared Stylelint baseline (pins `stylelint-config-standard`); safe on all CSS, including token-source files                           |
| `stylelint/design-tokens`                                        | Opt-in: forbids raw color literals (hex / named / `rgb()` / `oklch()` / …) so colors flow through tokens; layer onto `base`           |

### Severity tiers

Type-safety + correctness + duplication + eslint-disable-abuse rules are
`error`. **Complexity / size budgets are `warn`** — you can't refactor an
existing backlog in one PR, so gate new code first and flip to `error` per repo
once the baseline is under budget. Pure-opinion rules that fight domain naming
(`unicorn/name-replacements`, abbreviation nagging, etc.) are disabled outright.

Function length is two-tier: the quality concern **warns at 50 lines** (the
"fits on a screen" nudge), and `eslint/strict-size` **errors at 80** — a hard
stop for runaway functions without red-walling the 50–80 grey zone. Files use one
tier (400, warn → error) since splitting a file is mechanical.

Once a repo is under the size budget, lock it in by appending `eslint/strict-size`,
which promotes `max-lines` + `max-lines-per-function` to `error` (config/scripts
stay exempt). Cognitive/cyclomatic complexity intentionally stays `warn` — hard-
gating it rewards extracting nonsense helpers to beat the metric.

```js
import base from "@unraid/js-standards/eslint/base";
import strictSize from "@unraid/js-standards/eslint/strict-size";

export default [...base, ...strictSize];
```

## What the quality rules catch

- **Type escapes** — `no-explicit-any`, `no-non-null-assertion`, unsafe `any`
  assignment/call/return (typescript-eslint `strict-type-checked`).
- **Async bugs** — floating & misused promises, needless `await` (a common
  Workers footgun).
- **Needless code** — `no-unnecessary-condition` flags pointless guards on
  non-nullable values; knip deletes orphaned files/exports/deps.
- **Sprawl** — complexity, cognitive-complexity, `max-lines`, `max-params`,
  nesting budgets force refactors instead of 300-line functions.
- **Copy-paste** — sonarjs duplicate-string / identical-functions.
- **Escape hatches** — `eslint-comments` bans blanket / undescribed
  `eslint-disable`.
- **Redundant comments** — deslop flags comments that just restate the code.
- **Nuxt data fetching** (nuxt/vue preset) — reserves `$fetch()` for
  user-triggered requests (event handlers, mutations) and flags data-loading
  `$fetch()` — a top-level `await $fetch()` in `<script setup>` or `$fetch()`
  inside a lifecycle hook — in favor of `useFetch()`/`useAsyncData()` (SSR payload
  transfer, request dedupe, consistent pending/error state). `$fetch()` inside
  function bodies is left alone.

## CSS conventions

Prefer framework-native styles first: Vue/Nuxt component CSS belongs in
`<style>` blocks, shared app styling belongs in the repo's stylesheet/Tailwind
layer, and packageable UI primitives should use the styling API native to that
component system.

When a Worker or server-rendered helper must include page-specific CSS, keep the
source as a real stylesheet when the build tool supports it:

- Put page styles in a colocated `.css` file and import it as raw text when the
  response needs inline `<style>` output.
- Use a regular stylesheet route/static asset when the app already has an asset
  pipeline and the extra request/cache boundary is desirable.
- Use SCSS only in repos that already compile SCSS; do not add Sass for one
  generated page.
- Write normal formatted CSS: one selector per block, one declaration per line,
  blank lines between rule groups, and expanded `@media` blocks.
- Group design tokens/custom properties at the top, including theme overrides.
- If a build tool cannot import a CSS file, use a named module-level
  `String.raw` template as the fallback. Do not put stylesheet blobs inside
  render function bodies.
- Do not commit minified or one-line CSS blobs unless the file is generated.

```ts
import formCss from "./form.css?raw";

export function renderFormHead(): string {
  return `<style>${formCss}</style>`;
}
```

### Stylelint

Two Stylelint configs enforce the conventions above on hand-authored `.css`:

- **`stylelint/base`** pins `stylelint-config-standard` so every repo holds CSS
  to the same correctness bar (valid syntax, no duplicate selectors/properties,
  modern color-function notation). Formatting stays with Prettier — the standard
  config is non-stylistic, so they do not fight. Safe on **all** stylesheets,
  including the files that define design tokens.
- **`stylelint/design-tokens`** layers on top for component/feature CSS and
  forbids **raw color literals** — hex, named colors, and `rgb()` / `hsl()` /
  `oklch()` / `color()` — so every color flows through a token (`var(--…)`)
  instead of being hardcoded. This is what keeps theming and light/dark handling
  in one place; it also catches a raw literal smuggled into a `var(--token, #abc)`
  fallback, which otherwise renders the literal when the token is missing instead
  of failing visibly.

Install Stylelint alongside this package (it is an optional peer) and compose the
configs. Restrict `design-tokens` to the CSS you hand-write, and leave the files
that _define_ tokens on `base` only (they legitimately hold raw color values):

```js
// stylelint.config.mjs
import base from "@unraid/js-standards/stylelint/base";
import designTokens from "@unraid/js-standards/stylelint/design-tokens";

export default {
  ...base,
  ...designTokens,
  rules: { ...base.rules, ...designTokens.rules },
  overrides: [
    // Token-source files define colors, so keep them on the baseline only.
    { files: ["**/tokens/**/*.css"], rules: { ...base.rules } },
  ],
};
```

Validating custom-property _names_ against a known token set (catching a
reference to a token that does not exist) is a project-level concern — add a
repo-local allowlist rule for that. These configs guarantee a value is a token
reference rather than a raw literal.

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
"prettier": "@unraid/js-standards/prettier",
"scripts": {
	"format": "prettier . --write",
	"format:check": "prettier . --check"
}
```

For repos with existing formatting debt, wire `format:check` to the cleaned
paths first, then broaden it as the repo is formatted. Do not mix Prettier into
`lint` until the checked paths are under budget.

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

## Compatibility: `strictNullChecks` is REQUIRED

These presets are **incompatible with repos that compile without
`strictNullChecks`**. There is no supported escape hatch — enable the flag.

Several type-aware rules (`no-unnecessary-condition`,
`prefer-nullish-coalescing`, `no-unnecessary-boolean-literal-compare`,
`no-useless-default-assignment`, `no-unnecessary-type-assertion`,
`no-unnecessary-type-conversion`, `sonarjs/different-types-comparison`) are
only sound when `null`/`undefined` exist in the type system. Without the flag
they treat every optional value as always-present — and their **autofixes
still apply**, silently rewriting behavior. Observed in production use:
`--fix` deleted a live destructuring default and stripped `as` casts the real
typechecker requires, breaking typecheck from a lint run.

How to know you're affected: each of these rules self-reports
`This rule requires the 'strictNullChecks' compiler option` at position 0:1
of every file. Treat that message as a **configuration error and fix the
tsconfig** — do not baseline it away with `--suppress-all`, which is exactly
how it goes unnoticed.

The shared `tsconfig/*` exports already enable strict mode. Nuxt apps that
override `typescript.tsConfig.compilerOptions` must keep at least
`strictNullChecks: true`. Migration is cheaper than it looks: unraid/account
enabled the flag with 161 mechanical fixes, and its lint-suppressions
baseline shrank 36% because most of the "debt" was false findings from the
unsound configuration (unraid/account#1564).

## Gotchas

### `no-restricted-imports` / `no-restricted-syntax` cannot be merged

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

The same caveat applies to `no-restricted-syntax`: the `vue` concern sets it (on
`**/*.vue`) to steer data-loading `$fetch()` toward `useFetch()`/`useAsyncData()`.
If a consuming repo adds its own `no-restricted-syntax`, fold those selectors in
rather than replacing the block.

### Deduping plugins when layering on `@nuxt/eslint-config`

The `nuxt`/`vue` presets pull Nuxt's bundled typescript-eslint / unicorn /
import-x. Combined with our `typescript` + `quality` concerns that can produce
two copies of a plugin and ESLint throws _"Cannot redefine plugin"_. Pin them to
one version in the consumer:

```jsonc
// package.json → pnpm.overrides
"@typescript-eslint/eslint-plugin": "8.62.1",
"@typescript-eslint/parser": "8.62.1",
"@typescript-eslint/utils": "8.62.1",
"eslint-plugin-unicorn": "69.0.0",
"eslint-plugin-import-x": "4.17.1"
```

## Linting architecture: ESLint authoritative + Oxlint pre-pass

**ESLint is the authoritative gate.** It's the only tool that covers everything
we need: Vue `<template>` rules, sonarjs cognitive-complexity + duplication,
deslop redundant-comment detection, and the full type-aware set including
`no-unnecessary-condition` and `no-misused-promises`. It's slow (~135s on
community-apps-worker) but complete — run it in CI and pre-push.

**Oxlint is a fast pre-pass for local feedback.** It runs the syntactic subset
**~300× faster** (0.4s vs 135s) and parses `.vue` SFCs — ideal for editor/save
and pre-commit so you catch cheap mistakes instantly without waiting for the
full ESLint run. It does NOT replace ESLint (it can't do Vue templates, sonarjs,
deslop, or a couple of type-aware rules).

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

### Optional: type-aware Oxlint (fast advisory)

If you want fast _type-aware_ feedback too, Oxlint's `--type-aware` mode runs the
semantic rules (unsafe-`any` family, floating promises, `await-thenable`,
`no-base-to-string`, …) on the Go TypeScript compiler (`tsgo`) — measured at
**~2.8s vs ESLint's 135s**, no monorepo crash. Use the `oxlint/type-aware` preset
(= `oxlint/base` + `pedantic`, with the noisiest opt-in rules disabled):

```jsonc
// .oxlintrc.json
{
  "extends": ["./node_modules/@unraid/js-standards/src/oxlint/type-aware.json"],
}
```

```jsonc
// package.json — needs the Go backend as a devDep
"devDependencies": { "oxlint-tsgolint": "^0.24.0" },
"scripts": { "lint:types:fast": "oxlint --type-aware" }
```

This is a fast **advisory** for local use, not a replacement — ESLint stays the
authoritative gate. Oxlint's type-aware set (oxlint 1.72 / tsgolint 0.24) covers
the bulk of type-safety but **not** `no-unnecessary-condition` /
`no-misused-promises`, and never the Vue/sonarjs/deslop rules. It's preview +
pinned to a `tsgo` dev build.

## Why ESLint and not Biome / Oxlint (2026)

The faster Rust linters are real and worth using — but not as the _base_ for our
stack:

- **Our repos are Nuxt/Vue.** Oxlint can't fully support `eslint-plugin-vue`
  (Vue uses its own compiler / modified AST, so many rules can't run against SFC
  templates), and Biome's Vue/Nuxt story is still thin. ESLint has the only
  mature Vue/Nuxt configs.
- **The quality-rule value lives in ESLint plugins.** unicorn, sonarjs, deslop,
  and eslint-comments have no Biome/Oxlint equivalent.
- **Type-aware rules are the core of this config.** typescript-eslint's
  strict-type-checked is fully mature; Oxlint's `tsgolint` type-aware mode is
  still preview with known memory/deadlock issues on large monorepos — and we
  are a monorepo.

**Planned optimization (not blocking):** add Oxlint as a fast _pre-pass_
(pre-commit + first CI step) for the syntactic rules it already covers — it's
50–100× faster and gives near-instant local feedback — with
`eslint-plugin-oxlint` turning off the ESLint rules Oxlint handles to avoid
double work. ESLint stays authoritative for type-aware + Vue + quality rules. If
that pre-pass lands, it ships here as an `oxlint/base` export.

## Rollout guidance

New rules land **warn-first** for one minor, then flip to `error`. Pin an exact
version in consumers; let Renovate open the bump PR so its CI run is the test.

## Publishing

Currently `private` + GitHub Packages (`publishConfig.access: "restricted"`).
To go public later: set `"private": false`, `access: "public"`, drop the
`registry` override, and publish to npm.
