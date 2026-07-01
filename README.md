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

## Rollout guidance

New rules land **warn-first** for one minor, then flip to `error`. Pin an exact
version in consumers; let Renovate open the bump PR so its CI run is the test.

## Publishing

Currently `private` + GitHub Packages (`publishConfig.access: "restricted"`).
To go public later: set `"private": false`, `access: "public"`, drop the
`registry` override, and publish to npm.
