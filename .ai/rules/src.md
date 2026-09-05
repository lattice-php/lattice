---
paths:
  - packages/core/src/Option.php
---

# Src

## Option is a shared wire type — widening it has a fixed checklist
Every option-driven control (select, choice, segmented control, table filters, checkbox group) serializes the same `Lattice\Core\Option`, and nulls are serialized, so a new facet adds a key to every option on the wire. Adding one means, in order: append the promoted property after `data` (positional callers), teach `Option::expand()`/`from()` the new array key, widen `HasOptions::option()` so named args work, hand-edit `packages/core/resources/js/types.ts` (the TS `Option` is hand-written there, NOT emitted by `composer types` despite the `#[TypeScript]` attribute — declare new facets optional to spare every literal), run `composer types`, regenerate fixtures with `LATTICE_UPDATE_FIXTURES=1 vendor/bin/pest`, and fix the ~55 exact-shape assertions across tests/Feature/Forms, tests/Feature/Tables, and tests/Unit/Tables that compare whole option arrays.
