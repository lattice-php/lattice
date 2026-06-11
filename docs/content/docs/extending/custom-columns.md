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

```php
<?php

namespace App\Tables\Columns;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;

#[Component('column.status-badge')]
class StatusBadge extends Column
{
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: 'column.status-badge',
            props: [],
        );
    }
}
```

Add public properties for anything the cell renderer needs at render time. For example, a colour map that controls which status gets which colour:

```php
#[Component('column.status-badge')]
class StatusBadge extends Column
{
    /** @var array<string, string> */
    protected array $colorMap = [];

    /** @param array<string, string> $colorMap */
    public function colorMap(array $colorMap): static
    {
        $this->colorMap = $colorMap;

        return $this;
    }

    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: 'column.status-badge',
            props: $this->colorMap !== [] ? ['colorMap' => $this->colorMap] : null,
        );
    }
}
```

## 4. The generated React cell renderer

```tsx
import type { ColumnCellComponent } from "@lattice-php/lattice";

export const StatusBadgeCell: ColumnCellComponent = ({ value }) => {
  return <span>{String(value ?? "")}</span>;
};
```

A `ColumnCellComponent` receives `{ column, row, value }`:

- `value` — the raw cell value (the column's key resolved from the row).
- `row` — the full row data object.
- `column` — the serialized column descriptor, including `column.props` for any extra data sent from PHP.

Replace the stub body with real UI:

```tsx
import type { ColumnCellComponent } from "@lattice-php/lattice";

const colorClasses: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
};

export const StatusBadgeCell: ColumnCellComponent = ({ column, value }) => {
  const label = String(value ?? "");
  const map = (column.props?.colorMap as Record<string, string> | undefined) ?? colorClasses;
  const classes = map[label] ?? "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
};
```

After running `lattice:typescript`, `column.props` is narrowed to the generated type so you can drop the cast.

## 5. The column plugin registration

The generator appended an entry to `resources/js/lattice/columns.ts`:

```ts
import { createColumnPlugin } from "@lattice-php/lattice";
import { StatusBadgeCell } from "./columns/status-badge";

export const appColumns = createColumnPlugin({
  name: "app",
  columns: {
    "column.status-badge": StatusBadgeCell,
  },
});
```

## 6. Wire columns in app.tsx

Create the column registry from your plugin and pass it to `Provider`:

```tsx
import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import LatticePage from "@lattice-php/lattice/page";
import { createColumnRegistry, Provider, registry } from "@lattice-php/lattice";
import { appColumns } from "./lattice/columns";

const columns = createColumnRegistry(appColumns);

createInertiaApp({
  resolve: (name) => {
    if (name === "lattice/page") return { default: LatticePage };
    const pages = import.meta.glob("./Pages/**/*.tsx", { eager: true });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    if (!el) return;
    createRoot(el).render(
      <Provider registry={registry} columns={columns}>
        <App {...props} />
      </Provider>,
    );
  },
});
```

If you also have custom fields or components, pass both `registry={appRegistry}` (from `extendRegistry`) and `columns={columns}` to the same `Provider`.

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
