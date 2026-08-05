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
| `eslint/react`              | React JSX/TSX components + hooks rules + jsx-a11y recommended (curated, anti-slop)                                                   |
| `eslint/cloudflare-workers` | Workers runtime globals + no-Node-builtin guards                                                                                     |
| `eslint/testing`            | Spec/fixture relaxations                                                                                                             |
| `eslint/playwright`         | Playwright specs (recommended + curated matcher/diagnostic rules) and configs (mandatory action/navigation timeouts)                 |
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

## Framework concerns

### Vue / Nuxt

`eslint/vue` adds Nuxt's own flat config (SFC parsing, auto-import +
generated-component awareness) plus our team conventions, and steers
data-loading `$fetch()` toward `useFetch()`/`useAsyncData()` (see above). It is
already folded into the `eslint/nuxt` preset; import it directly only when
composing a bespoke stack.

```js
import base from "@unraid/js-standards/eslint/base";
import vue from "@unraid/js-standards/eslint/vue";

export default [...base, ...vue];
```

Because it pulls Nuxt's bundled typescript-eslint / unicorn / import-x, dedupe
those to a single version in the consumer (see Gotchas → pnpm overrides).

### React

`eslint/react` layers React support onto a base/core preset. It registers
`@eslint-react/eslint-plugin`, `eslint-plugin-react-hooks`, and
`eslint-plugin-jsx-a11y`, applying only to component files (`.jsx` / `.tsx`).

```js
import base from "@unraid/js-standards/eslint/base";
import react from "@unraid/js-standards/eslint/react";

export default [...base, ...react];
```

The rule set is **curated for correct React UI patterns + anti-slop**, not
@eslint-react's full noisy `recommended`: `@eslint-react/no-missing-key`,
`@eslint-react/no-duplicate-key`,
`@eslint-react/no-nested-component-definitions`,
`@eslint-react/dom-no-unsafe-target-blank`, and
`@eslint-react/dom-no-unknown-property` are errors;
`@eslint-react/no-array-index-key`, `@eslint-react/jsx-no-useless-fragment`, and
`@eslint-react/dom-no-dangerously-set-innerhtml` are warns; jsx-a11y's
`recommended` flat config is spread in whole; and `react-hooks/rules-of-hooks`
(error) + `react-hooks/exhaustive-deps` (warn) — sourced from
`eslint-plugin-react-hooks`, not @eslint-react's own equivalents — guard the
classic hook footguns. Component files are exempted from
`unicorn/filename-case` since React components are PascalCase.

Composition note: unlike the Vue layer, this concern only bundles the three
React plugins (not typescript-eslint / unicorn), so it composes cleanly with the
`typescript` + `quality` concerns without the "Cannot redefine plugin" dedupe.
Layer it after the base/core concerns and before prettier.

> **ESLint 10 native:** this concern uses `@eslint-react` (peer `eslint: "*"`),
> which is authored against the modern flat-config + context API and does not
> call the `context.getFilename()` method ESLint removed in v10. No
> `settings.react.version` pin or other workaround is required — the curated
> rules are AST-based and React-version-independent, so they run on plain `.jsx`
> with no type information.

### Playwright

```js
import playwright from "@unraid/js-standards/eslint/playwright";
```

Two halves — the specs and the config that runs them.

**Specs** (`**/*.{spec,test}.*`) get `eslint-plugin-playwright`'s recommended set
(conditional logic in tests, forgotten `await` on assertions,
`page.waitForTimeout` sleeps, focused/skipped tests left behind) plus a curated
tier the plugin ships but leaves out of recommended, all at `error`: matcher
choices that make a failure legible (`prefer-to-be`, `prefer-comparison-matcher`,
…), `require-to-pass-timeout`, `no-commented-out-tests`, locator quality
(`no-raw-locators`, `no-nth-methods`, `prefer-native-locators`,
`no-get-by-title`), and structure (`require-hook`, `require-top-level-describe`,
`no-slowed-test`).

This states the target rather than the current state of any one suite. A repo
adopting mid-stream downgrades specific rules in its own config, which keeps the
exception visible and local instead of hidden in the shared baseline.

Pure convention stays **off** — `prefer-lowercase-title` (style), `require-tags`
and `no-restricted-*` (need a project vocabulary), `require-soft-assertions`
(changes failure semantics), `max-expects` (an arbitrary budget), and `no-hooks`
(contradicts `require-hook`).

> The plugin's rules key off bare `test`/`expect` identifiers. In a repo that
> also runs Vitest or Jest under that glob, re-scope `files` on the spec entry to
> where Playwright actually owns — otherwise the rules give Playwright advice
> about a unit test.

**Configs** (`playwright*.config.*`) must set `use.actionTimeout` and
`use.navigationTimeout` explicitly.

Playwright defaults both to `0`, which means _no timeout_ rather than a sensible
one. `expect()` has its own default, so a config that sets `expect.timeout` looks
bounded — but that ceiling only covers assertions. A bare `.click()` or `.goto()`
on an element that never becomes actionable waits for the entire test timeout.

On a suite with a generous per-test budget that is a silent blackout: no output,
no failing assertion, and a final error naming the test rather than the call that
hung. Setting both turns it into a fast failure that names the locator.

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

Peer deps the consumer provides: `eslint >=10.4`, `typescript >=5.5`, and
(for the Nuxt preset) `@nuxt/eslint-config`. Oxlint is an optional peer
(`oxlint >=1.77`) for repositories that enable the fast pre-pass.

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

### TypeScript 7 (native tsgo)

TypeScript 7 (the native Go compiler, "Project Corsa") **does not ship the
JavaScript compiler API** that type-aware linters depend on — `ts.createProgram`
is gone. So the ESLint `typescript`/`base` concerns' type-aware rules do **not**
run on TS 7: `typescript-eslint` won't even install against `typescript@7` (its
peer is `>=4.8.4 <6.1.0`) and crashes if forced. TypeScript 7.1 is expected to
ship a new (and different) programmatic API; until then there are two supported
paths:

**1. Side-by-side TypeScript 6.0 (keep `typescript-eslint`).** Per the
TypeScript team's guidance, TS 7 is designed to run alongside a TS 6.0 install
for tools that still need programmatic compiler access. Keep `typescript@6` as
the `typescript` your linter/editor resolve (typescript-eslint's peer already
allows `6.0.x`) and build/typecheck with the native compiler
(`@typescript/native-preview`). The ESLint concerns here work unchanged.

**2. Oxlint + `oxlint-tsgolint` (native TS 7).** Oxlint parses TypeScript with
its own Rust parser (no dependency on the `typescript` package) and gets type
information from `tsgolint` (built on `typescript-go`), so it runs **natively on
TS 7**. Use the `oxlint/type-aware` preset with `oxlint --type-aware` (see
[Optional: type-aware Oxlint](#optional-type-aware-oxlint-fast-advisory)) — the
only linter that fully runs on a pure TS 7 toolchain today.

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

## Linting architecture: Oxlint first + full ESLint

The package now dogfoods the same workflow it recommends to consumers:

- **Oxlint runs first** for fast syntax, correctness, suspicious-code,
  performance, import, promise, TypeScript, Unicorn, and Oxc checks.
- **ESLint still runs fully** afterward. Keep the full config when you need the
  Vue template rules, sonarjs cognitive-complexity and duplication, deslop,
  eslint-comments, and the complete typescript-eslint type-aware set.
- **ESLint caching and worker threads** are enabled for repeat and large-tree
  runs. The cache lives under `.cache/` and must not be committed.

The package scripts expose both the combined workflow and each pass separately:

```bash
pnpm lint                  # oxlint, then cached full ESLint
pnpm lint:fast             # oxlint only
pnpm lint:eslint           # cached full ESLint with worker threads
pnpm lint:eslint:full      # full-tree ESLint without the cache
pnpm lint:eslint:errors    # errors-only local check; skips warn rules
pnpm lint:eslint:stats     # JSON timing data for profiling
```

Do not use `lint:eslint:errors` for suppression-baseline generation: it skips
warning-level rules. For a deliberate full baseline, run `lint:eslint:full`
with the repository's reviewed `--suppress-all` command. Use
`--cache-strategy content` instead of the default metadata strategy only when
branch switches or generated file mtimes cause unnecessary cache misses.

### Consumer quick start

Install the shared presets and the two linters:

```bash
pnpm add -D @unraid/js-standards eslint oxlint typescript
```

Add these two small config files at the consumer repository root:

```js
// eslint.config.mjs
import unraid from "@unraid/js-standards/eslint/base";

export default [...unraid];
```

```jsonc
// .oxlintrc.json
{
  "extends": ["./node_modules/@unraid/js-standards/src/oxlint/base.json"],
}
```

Then copy the scripts below into `package.json`. Use the `nuxt`, `worker`, or
`node` ESLint export instead of `base` when the repository needs that runtime.

Oxlint's `extends` entries are file paths, which is why the quick-start points
at the package's installed `src/oxlint/base.json` file.

**2. Keep ESLint full by default.** Do not add the Oxlint dedupe concern when the
ESLint pass is the authoritative complete run:

```js
import unraid from "@unraid/js-standards/eslint/nuxt";

export default [...unraid];
```

**3. Optionally dedupe an explicitly optimized ESLint configuration.** For very
large repositories, append the exported concern last to turn off ESLint rules
already covered by the shared Oxlint config. This reduces duplicate work, but
it is a different mode from the full ESLint gate:

```js
import unraid from "@unraid/js-standards/eslint/nuxt";
import oxlintDisable from "@unraid/js-standards/eslint/oxlint";

export default [
  ...unraid,
  ...oxlintDisable(), // must be last in the optimized mode
];
```

Consumer scripts should mirror the package scripts:

```jsonc
"scripts": {
	"lint:oxlint": "oxlint",
	"lint:eslint": "eslint . --cache --cache-location .cache/eslint/ --concurrency=auto",
	"lint:eslint:full": "eslint . --concurrency=auto",
	"lint:fast": "pnpm run lint:oxlint",
	"lint": "pnpm run lint:oxlint && pnpm run lint:eslint"
}
```

For pre-commit, pass only staged source files to Oxlint and the cached ESLint
command. Keep the full-tree `lint:eslint:full` run in CI or pre-push. ESLint's
`--stats --format json` and Oxlint's `--debug timings` are diagnostic modes,
not normal lint commands.

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
// package.json — needs the Go backend as a devDep. The version tracks the
// TypeScript release it targets: 7.0.2xxx ↔ TS 7.0.2.
"devDependencies": { "oxlint-tsgolint": "^7" },
"scripts": { "lint:types:fast": "oxlint --type-aware" }
```

Oxlint type-aware went **stable (2026-07-22)** and now covers **59 of 61** of
typescript-eslint's type-aware rules (oxlint 1.77 / tsgolint 7.x, tracking TS
7.0.2) — but never the Vue/sonarjs/deslop rules, which stay ESLint-only.

- **On TS ≤ 6**, treat it as a fast **advisory** alongside the authoritative
  ESLint type-aware gate.
- **On TS 7** (see [TypeScript 7](#typescript-7-native-tsgo)), it is the
  **primary** type-aware engine — `typescript-eslint` can't run there, so Oxlint
  `--type-aware` owns type-safety while ESLint keeps the syntactic + Vue/quality
  rules.

## Why ESLint and Oxlint together (2026)

The faster Rust linter is useful as the first pass, but ESLint remains the
complete gate for this stack:

- **Our repos are Nuxt/Vue.** Oxlint can't fully support `eslint-plugin-vue`
  (Vue uses its own compiler / modified AST, so many rules can't run against SFC
  templates), and Biome's Vue/Nuxt story is still thin. ESLint has the only
  mature Vue/Nuxt configs.
- **The quality-rule value lives in ESLint plugins.** unicorn, sonarjs, deslop,
  and eslint-comments have no Biome/Oxlint equivalent.
- **Type-aware rules are the core of this config.** typescript-eslint's
  strict-type-checked remains the complete ESLint type-aware gate; Oxlint's
  native type-aware mode is available separately for repositories using its
  TypeScript 7-compatible toolchain.

## Rollout guidance

New rules land **warn-first** for one minor, then flip to `error`. Pin an exact
version in consumers; let Renovate open the bump PR so its CI run is the test.

## Publishing

Currently `private` + GitHub Packages (`publishConfig.access: "restricted"`).
To go public later: set `"private": false`, `access: "public"`, drop the
`registry` override, and publish to npm.
