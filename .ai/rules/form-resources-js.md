---
paths:
  - 'packages/form/resources/js/**'
---

# Form Resources Js

## Relative self-imports for form-package modules with changed types
The form package's vite dts build clears tsconfig `paths` (vite.config.ts `compilerOptions: { paths: {} }`), so absolute self-imports (`@lattice-php/form/*`) resolve against the package's own stale `dist` d.ts — new/changed exported types then fail the library build until dist is rebuilt. When touching a module whose types change (generated.ts, base/field.tsx, ...), import it relatively inside the package, same as the existing ui-package rule. types.ts already imports `./generated` relatively for this reason.
