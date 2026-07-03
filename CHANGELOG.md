# Changelog

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
