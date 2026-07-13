# Changelog

## [1.3.1](https://github.com/unraid/js-standards/compare/js-standards-v1.3.0...js-standards-v1.3.1) (2026-07-13)


### Bug Fixes

* **eslint:** resolve type-import rule conflict by pinning all three to inline ([#19](https://github.com/unraid/js-standards/issues/19)) ([52bfb2b](https://github.com/unraid/js-standards/commit/52bfb2bc2e4245a8afb3eb1f5ca683b0eacd8d19))


### Documentation

* add CSS conventions ([#17](https://github.com/unraid/js-standards/issues/17)) ([bfc0fe9](https://github.com/unraid/js-standards/commit/bfc0fe93f61f426fe6662b746bd093a86bd35d4f))

## [1.3.0](https://github.com/unraid/js-standards/compare/js-standards-v1.2.0...js-standards-v1.3.0) (2026-07-08)


### Features

* **eslint:** steer data-loading $fetch to useFetch/useAsyncData in Nuxt SFCs ([#15](https://github.com/unraid/js-standards/issues/15)) ([75507b1](https://github.com/unraid/js-standards/commit/75507b1622e00f861d25b5aad63a068c6c113c76))

## [1.2.0](https://github.com/unraid/js-standards/compare/js-standards-v1.1.1...js-standards-v1.2.0) (2026-07-08)


### Features

* @unraid/js-standards anti-slop presets (eslint/prettier/tsconfig/knip) ([9bd18e1](https://github.com/unraid/js-standards/commit/9bd18e11d38d082e75753cbbd8fac217c8b814f1))
* add node preset, node tsconfig, and runtime/ ignore for Lambdas ([#14](https://github.com/unraid/js-standards/issues/14)) ([fc25423](https://github.com/unraid/js-standards/commit/fc254232590c3ac5271a3945767a5fec9b8e4480))
* **eslint:** add opt-in strict-size preset; two-tier function length ([#6](https://github.com/unraid/js-standards/issues/6)) ([22604fb](https://github.com/unraid/js-standards/commit/22604fb9a78ee01ce573fe8f7e65f19041bb7c61))
* **eslint:** require strictNullChecks; align oxlint eqeqeq with eslint ([#4](https://github.com/unraid/js-standards/issues/4)) ([58ea5fc](https://github.com/unraid/js-standards/commit/58ea5fc5889ab050e71910d3e5e95b9781270c02))
* **oxlint:** add shared oxlint/base pre-pass config ([5a2f20c](https://github.com/unraid/js-standards/commit/5a2f20c4335baf0791f90569189b131268848536))
* **oxlint:** add type-aware preset (base + pedantic, ~2.8s full type-safety on CAW) ([5dfbe24](https://github.com/unraid/js-standards/commit/5dfbe24e6c753d0c08e3a138bbc599e12320e43e))
* **oxlint:** eslint/oxlint dedupe concern + pre-pass workflow docs ([a34755d](https://github.com/unraid/js-standards/commit/a34755d0d132ae6d897a0d67abc9953cb7485918))
* **release:** cut a release for every conventional commit type ([#12](https://github.com/unraid/js-standards/issues/12)) ([56dc65d](https://github.com/unraid/js-standards/commit/56dc65d69274adea2d748e2d6725336cdf9cefbe))


### Bug Fixes

* **eslint/nuxt:** resolve FlatConfigComposer to array via top-level await ([1de7ee5](https://github.com/unraid/js-standards/commit/1de7ee5cff4f16f7ebc51ecd786093364128b01e))
* **eslint/oxlint:** destructure builder from default export (no named export) ([832b4b0](https://github.com/unraid/js-standards/commit/832b4b0e4e2dc89c1f7c5a2f03bd8dfb834a0695))
* **eslint:** disable premature unicorn/prefer-uint8array-base64 ([#7](https://github.com/unraid/js-standards/issues/7)) ([97d6364](https://github.com/unraid/js-standards/commit/97d63646da3490d1d2be116c5403f9f756d1b4e5))
* **knip:** drop entry/project overrides that defeat Nuxt auto-detection ([e9eb4fd](https://github.com/unraid/js-standards/commit/e9eb4fd431bea800add1f4e29ea9f80c615609f3))


### Reverts

* keep ESLint authoritative (vue/sonarjs/deslop/2 type-aware rules); oxlint = fast pre-pass + optional type-aware advisory ([a7fbc4b](https://github.com/unraid/js-standards/commit/a7fbc4b112396aa97256803d4e9f2660f13c49e8))


### Refactors

* **eslint:** split into composable concerns (typescript/anti-slop/vue/cloudflare-workers/testing); retune tiers ([52a4f03](https://github.com/unraid/js-standards/commit/52a4f0329316bf6daaa26cb95a7cd589d40a5203))
* reframe as code-quality presets (rename anti-slop concern to quality, drop AI references) ([269dd8e](https://github.com/unraid/js-standards/commit/269dd8e7615bb6c77b21161ef24102e6ac3624f1))


### Chores

* configure for public npm publish (release-please + OIDC, matches @unraid/shared-callbacks setup) ([56ef01e](https://github.com/unraid/js-standards/commit/56ef01e812275df3a749d997f807a831c22fb187))
* **deps:** bump typescript-eslint from 8.62.1 to 8.63.0 ([#10](https://github.com/unraid/js-standards/issues/10)) ([9bb8153](https://github.com/unraid/js-standards/commit/9bb8153a745b22c85254d6bc5277fc10e74790af))
* **main:** release 1.0.0 ([#2](https://github.com/unraid/js-standards/issues/2)) ([3364998](https://github.com/unraid/js-standards/commit/3364998f6d944f82e481c80bee885a4cc12c75b0))
* **main:** release 1.1.0 ([#5](https://github.com/unraid/js-standards/issues/5)) ([8209036](https://github.com/unraid/js-standards/commit/82090369f58a6993a05a431be1267b28ed35658d))
* **main:** release 1.1.1 ([#8](https://github.com/unraid/js-standards/issues/8)) ([69eb2c5](https://github.com/unraid/js-standards/commit/69eb2c5eac32a6f259a3e66774894908abfea99e))
* Set npm as the package ecosystem for Dependabot ([f497f21](https://github.com/unraid/js-standards/commit/f497f215236532acc30d795febf694d562d70a95))


### Documentation

* **knip:** note Nuxt 4 app/ srcDir entry hint ([342d0af](https://github.com/unraid/js-standards/commit/342d0afee1fe0262e25dac4c738f56aae87e7775))
* no-restricted-imports/plugin-dedupe gotchas + ESLint-vs-Biome/Oxlint rationale ([63228d9](https://github.com/unraid/js-standards/commit/63228d9eda5666316db8b9e2dafc7cd39edc1c16))
* **oxlint:** document type-aware tier + coverage gaps ([da642f0](https://github.com/unraid/js-standards/commit/da642f0119d7624c335a411c19a3de88fc99a5c9))

## [1.1.1](https://github.com/unraid/js-standards/compare/v1.1.0...v1.1.1) (2026-07-07)


### Bug Fixes

* **eslint:** disable premature unicorn/prefer-uint8array-base64 ([#7](https://github.com/unraid/js-standards/issues/7)) ([97d6364](https://github.com/unraid/js-standards/commit/97d63646da3490d1d2be116c5403f9f756d1b4e5))

## [1.1.0](https://github.com/unraid/js-standards/compare/v1.0.0...v1.1.0) (2026-07-03)


### Features

* **eslint:** add opt-in strict-size preset; two-tier function length ([#6](https://github.com/unraid/js-standards/issues/6)) ([22604fb](https://github.com/unraid/js-standards/commit/22604fb9a78ee01ce573fe8f7e65f19041bb7c61))
* **eslint:** require strictNullChecks; align oxlint eqeqeq with eslint ([#4](https://github.com/unraid/js-standards/issues/4)) ([58ea5fc](https://github.com/unraid/js-standards/commit/58ea5fc5889ab050e71910d3e5e95b9781270c02))

## 1.0.0 (2026-07-01)


### Features

* @unraid/js-standards anti-slop presets (eslint/prettier/tsconfig/knip) ([9bd18e1](https://github.com/unraid/js-standards/commit/9bd18e11d38d082e75753cbbd8fac217c8b814f1))
* **oxlint:** add shared oxlint/base pre-pass config ([5a2f20c](https://github.com/unraid/js-standards/commit/5a2f20c4335baf0791f90569189b131268848536))
* **oxlint:** add type-aware preset (base + pedantic, ~2.8s full type-safety on CAW) ([5dfbe24](https://github.com/unraid/js-standards/commit/5dfbe24e6c753d0c08e3a138bbc599e12320e43e))
* **oxlint:** eslint/oxlint dedupe concern + pre-pass workflow docs ([a34755d](https://github.com/unraid/js-standards/commit/a34755d0d132ae6d897a0d67abc9953cb7485918))


### Bug Fixes

* **eslint/nuxt:** resolve FlatConfigComposer to array via top-level await ([1de7ee5](https://github.com/unraid/js-standards/commit/1de7ee5cff4f16f7ebc51ecd786093364128b01e))
* **eslint/oxlint:** destructure builder from default export (no named export) ([832b4b0](https://github.com/unraid/js-standards/commit/832b4b0e4e2dc89c1f7c5a2f03bd8dfb834a0695))
* **knip:** drop entry/project overrides that defeat Nuxt auto-detection ([e9eb4fd](https://github.com/unraid/js-standards/commit/e9eb4fd431bea800add1f4e29ea9f80c615609f3))


### Reverts

* keep ESLint authoritative (vue/sonarjs/deslop/2 type-aware rules); oxlint = fast pre-pass + optional type-aware advisory ([a7fbc4b](https://github.com/unraid/js-standards/commit/a7fbc4b112396aa97256803d4e9f2660f13c49e8))
