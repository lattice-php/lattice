---
paths:
  - 'packages/ui/resources/js/**'
---

# Resources Js

## ui package layout: components/, primitives/, lib/, root = runtime
The ui package has a three-tier layout: components/ holds everything that renders wire nodes (one folder per node type), primitives/ holds the generic presentational client primitives (dialog, input, ...), lib/ holds style/hook helpers (control, pill, column-sizing, use-*). The package root is reserved for node-type-AGNOSTIC runtime (navigation, click-behavior, action-menu-context) and entry points (index, plugin, types, generated) — do not add new loose component files there. Runtime bound to one node type lives in that node's component folder (the modal host is components/modal/modal-host.tsx). Infrastructure domains own their system, not its consumers: icons/, i18n/, format/, effects/, and toast/ each contain the respective system itself. Deep imports mirror the file location (@lattice-php/ui/primitives/input), and inside the ui package always import siblings relatively, never via @lattice-php/ui/* (absolute self-imports resolve against the stale dist and break browser-mode tests).
