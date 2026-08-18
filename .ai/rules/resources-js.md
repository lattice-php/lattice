---
paths:
  - 'packages/ui/resources/js/**'
---

# Resources Js

## ui package layout: components/, primitives/, lib/, root = runtime
The ui package has a three-tier layout: components/ holds everything that renders wire nodes (one folder per node type), primitives/ holds the generic presentational client primitives (dialog, popover, input, ...), lib/ holds style/hook helpers (control, pill, column-sizing, use-*). The package root is reserved for runtime infrastructure (modal-host, navigation, click-behavior, action-menu-context) and entry points (index, plugin, types, generated) — do not add new loose component files there. Deep imports mirror the file location (@lattice-php/ui/primitives/input), and inside the ui package always import siblings relatively, never via @lattice-php/ui/* (absolute self-imports resolve against the stale dist and break browser-mode tests).
