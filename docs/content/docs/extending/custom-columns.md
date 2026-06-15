---
title: Custom columns
description: Scaffold a custom table column cell renderer with a PHP class and a React cell component.
---

This walkthrough adds a `StatusBadge` column that renders a coloured pill based on a row's status value.

## 1. Publish the JS scaffold

If you have not done this yet:

```bash
php artisan vendor:publish --tag=lattice-js
```

This writes `resources/js/lattice/columns.ts` (and `plugin.ts` for fields/components) if they do not already exist.

## 2. Generate the column

```bash
php artisan lattice:column StatusBadge
```

This creates:

- `app/Tables/Columns/StatusBadge.php` — the PHP column class.
- `resources/js/lattice/columns/status-badge.tsx` — the React cell renderer stub.
- An entry in `resources/js/lattice/columns.ts` wiring them together.
- Runs `lattice:typescript` to refresh the generated types file.

The derived type string is `column.status-badge`. Pass `--type=` to override it.

## 3. The generated PHP class

A column reflects its **public** properties into its wire props — exactly like a component — so there
is no `toData()` and no separate props class to maintain.

```php
<?php

namespace App\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Column;

#[AsColumn(type: 'column.status-badge')]
class StatusBadge extends Column
{
    // Add public properties here; they are reflected into the column's
    // TypeScript props and passed to the cell renderer. Keep internal state
    // (filter flags, helpers) protected so it stays off the wire.
}
```

Add a **public** property for anything the cell renderer needs at render time, and a fluent setter for
it. For example, a colour map that controls which status gets which colour:

```php
#[AsColumn(type: 'column.status-badge')]
class StatusBadge extends Column
{
    /** @var array<string, string>|null */
    public ?array $colorMap = null;

    /** @param array<string, string> $colorMap */
    public function colorMap(array $colorMap): static
    {
        $this->colorMap = $colorMap === [] ? null : $colorMap;

        return $this;
    }
}
```

`colorMap` is public, so it lands in the column's `props`; declaring it nullable keeps the wire shape
honest (it is `null` until set). Internal state a cell never reads — filter flags, cached lookups —
stays `protected` so reflection leaves it off the wire.

## 4. The generated React cell renderer

```tsx
import type { ColumnCellComponent } from "@lattice-php/lattice";

export const StatusBadgeCell: ColumnCellComponent = ({ value }) => {
  return <span>{String(value ?? "")}</span>;
};
```

A `ColumnCellComponent` receives `{ column, props, row, value }`:

- `value` — the raw cell value (the column's key resolved from the row).
- `row` — the full row data object.
- `props` — the column's props sent from PHP. They are a loose bag by default; type the cell as `ColumnCellComponent<"column.status-badge">` to narrow them to your column's props (see below).
- `column` — the full serialized column descriptor (key, label, type, nested columns).

Replace the stub body with real UI:

```tsx
import type { ColumnCellComponent } from "@lattice-php/lattice";

const colorClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const StatusBadgeCell: ColumnCellComponent = ({ props, value }) => {
  const label = String(value ?? "");
  const map = (props?.colorMap as Record<string, string> | undefined) ?? colorClasses;
  const classes = map[label] ?? "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
};
```

To drop the cast, type the cell as `ColumnCellComponent<"column.status-badge">` and register it with `columnCell()` (the column equivalent of `eagerComponent`). After `lattice:typescript`, `props` is narrowed to your column's generated props:

```tsx
import { columnCell } from "@lattice-php/lattice";
import type { ColumnCellComponent } from "@lattice-php/lattice";

export const StatusBadgeCell: ColumnCellComponent<"column.status-badge"> = ({ props, value }) => {
  const map = props.colorMap ?? colorClasses; // typed, no cast
  // ...
};

// register the typed cell:
//   columns: { "column.status-badge": columnCell(StatusBadgeCell) }
```

## 5. The column plugin registration

The generator appended an entry to `resources/js/lattice/columns.ts`:

```ts
import { createPlugin } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createPlugin({
  name: "app",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
});
```

## 6. Wire columns in app.tsx

Extend the built-in registry with your column plugin and pass that registry to `Provider`:

```tsx
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice-php/lattice/page";
import { extendRegistry, Provider, registry } from "@lattice-php/lattice";
import { appColumns } from "./lattice/columns";

const appRegistry = extendRegistry(registry, appColumns);

createInertiaApp({
  resolve: (name) => {
    if (name === "lattice/page") return { default: LatticePage };
    const pages = import.meta.glob("./Pages/**/*.tsx", { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (!el) return;
    createRoot(el).render(
      <Provider registry={appRegistry}>
        <App {...props} />
      </Provider>,
    );
  },
});
```

If you also have custom fields or components, pass all of those plugins to the same `extendRegistry(registry, ...)` call.

## 7. Generate TypeScript types

```bash
php artisan lattice:typescript
```

This augments `ColumnProps` in `@lattice-php/lattice`:

```ts
declare module "@lattice-php/lattice" {
  interface ColumnProps {
    "column.status-badge": {
      colorMap: Record<string, string> | null;
    };
  }
}
```

`column.props` is now narrowed in the cell renderer, eliminating the cast.

## 8. Use the column in a table

```php
use App\Tables\Columns\StatusBadge;
use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;

/**
 * @extends EloquentTableDefinition<\App\Models\User>
 */
#[Table('app.users')]
final class UsersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
            StatusBadge::make('status')->label('Status')
                ->colorMap([
                    'active' => 'bg-green-100 text-green-800',
                    'archived' => 'bg-red-100 text-red-800',
                    'draft' => 'bg-gray-100 text-gray-800',
                ]),
        ];
    }

    /**
     * @return Builder<\App\Models\User>
     */
    public function builder(TableQuery $query): Builder
    {
        return \App\Models\User::query()->select(['id', 'name', 'status']);
    }
}
```
