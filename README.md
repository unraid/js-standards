# @unraid/js-standards

Lime Technology's shared JS/TS quality + **anti-slop** presets. One package, one
pinned toolchain, consumed by every LT JavaScript repo so AI-generated code is
held to the same aggressive bar everywhere.

Bundles and version-pins the whole stack (typescript-eslint, unicorn, sonarjs,
import-x, eslint-comments, deslop) so a consumer installs **one** dependency
instead of a dozen drifting ones.

## What's inside

| Export | Purpose |
| --- | --- |
| `@unraid/js-standards/eslint/base` | Framework-agnostic, type-aware, anti-slop ESLint flat config |
| `@unraid/js-standards/eslint/nuxt` | `base` + Nuxt 4 / Vue 3 + CF Workers globals |
| `@unraid/js-standards/eslint/worker` | `base` + CF Workers globals (non-Nuxt) |
| `@unraid/js-standards/prettier` | Shared Prettier config (single source of truth) |
| `@unraid/js-standards/tsconfig/base.json` | Extreme-strict tsconfig base |
| `@unraid/js-standards/tsconfig/nuxt.json` / `worker.json` | Framework variants |
| `@unraid/js-standards/knip/base` | Shared knip dead-code baseline |

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
