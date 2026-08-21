---
paths:
  - "packages/table/resources/js/**"
---

# Table Resources Js

## Table package layout mirrors ui: primitives/ is the pure shell, components/ is node-bound

`primitives/data-table.tsx` holds the props-only presentational shell (`DataTable`, `DataTableGrid`, header/filter/body cells with `kind`/`pinned`/`pinBoundary`/`pinIndex`, bars, `DataTablePagination`, `dataTableUtilityTracks`) and is exported from the package root so a design tool or custom page can render a static table that cannot drift from the live one. Primitives take no wire `node`, no table hooks, and no i18n — labels arrive as props. Everything that reads `useTable`, selection, column visibility/pinning/resizing state, or `useT` stays in `components/` and composes the primitives; when the shell's markup or classes must change, change the primitive, never re-inline markup in `components/table.tsx`.
