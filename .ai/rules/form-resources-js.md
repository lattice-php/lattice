---
paths:
  - 'packages/form/resources/js/**'
---

# Form Resources Js

## Package-internal imports are always relative
Inside packages/form/resources/js, always import package siblings relatively — never via `@lattice-php/form/*`, same as the ui-package rule. The package's vite dts build clears tsconfig `paths` (vite.config.ts `compilerOptions: { paths: {} }`), so absolute self-imports resolve against the package's own stale `dist` d.ts and fail the library build whenever exported types change.
