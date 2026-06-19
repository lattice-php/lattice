---
name: lattice-tables
description: Use when building or editing Lattice tables — creating EloquentTableDefinition or TableDefinition classes, declaring columns (TextColumn, NumberColumn, BooleanColumn, BadgeColumn, IconColumn, ImageColumn, StackColumn), making columns sortable or filterable, choosing pagination, backing a table with a custom data source, rendering a table on a page with Table::use(), or adding row and bulk actions.
---

# Building Lattice tables

A Lattice table is a listing backed by a **data source**. You declare columns in PHP; Lattice renders the React table and handles sorting, filtering, and pagination, fetching rows from the table's **signed** endpoint (`lattice/tables/{table}`). An Eloquent source ships out of the box.

## Defining a table

For a database-backed table, extend `EloquentTableDefinition` and implement `columns()` + `builder()`. The `#[AsTable('id')]` attribute gives a stable id so the table is discovered and addressed by its endpoint.

```php
use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;

/** @extends EloquentTableDefinition<Product> */
#[AsTable('app.products')]
class ProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->sortable()->filterable(),
            NumberColumn::make('price')->sortable()->filterable(),
            TextColumn::make('updated_at')->dateTime()->sortable(),
        ];
    }

    public function builder(TableQuery $query): Builder
    {
        return Product::query()->select(['id', 'name', 'price', 'updated_at']);
    }
}
```

`builder()` returns the **base query** — your own scoping only (a `select()`, eager loads, tenant constraints, a default order). Lattice applies the request's filters and sorts **on top** of it, driven by the columns' capabilities. The `TableQuery` argument is the read model of the current request (`->filters()`, `->sorts()`, page, size), so the builder can react — e.g. apply a default order only when `$query->sorts() === []`.

`TableDefinition` hooks beyond `columns()`: `source()`, `perPage()` (default `25`), `pagination()`, `striped()`, `emptyLabel()`, `actionsLabel()`, `actions($row)`, `bulkActions()`.

## Columns

Columns live in `Lattice\Lattice\Tables\Columns`. `Column::make('key')` reads `$row['key']`; the label defaults to the humanized key (override with `->label()`).

- **`TextColumn`** — `->date()`, `->time()`, `->dateTime()` (style: `full|long|medium|short`, e.g. `->dateTime(DateTimeStyle::Short)`), `->copyable()`, `->link('/products/{value}')` (`{value}` is substituted; pass `external: true` for outbound).
- **`NumberColumn`** — right-aligns and formats the value as a number; `->decimals(2)` fixes fraction digits (`->decimals(0, 2)` for a range); `->unit(NumberFormatUnit::Percent)` adds a locale-correct unit (percent, kilogram, byte, …). Filters as a number.
- **`MoneyColumn`** — formats as a currency amount; `->currency('EUR')` for a fixed currency or `->currencyField('currency')` to read the currency from another row field; symbol placement and decimals follow the viewer's locale.
- **`BooleanColumn`** — renders a check or cross; filters as a boolean.
- **`BadgeColumn`** — `->colors(['active' => 'green', 'invited' => 'yellow', 'archived' => 'gray'])`. Colors: `gray`, `red`, `green`, `yellow`, `blue`, `purple`, `orange` (unmapped → gray).
- **`IconColumn`** — `->icon(Icon::Star)` for one icon, or `->icons(['1' => Icon::Check, '0' => Icon::Minus])`; add `->colors([...])` to tint.
- **`ImageColumn`** — renders the value as an image URL: `->circular()`, `->size(40)`.
- **`StackColumn`** — group child columns into one cell: `->columns([TextColumn::make('name'), TextColumn::make('email')])`.

### Sortable & filterable

`->sortable()` and `->filterable()` are **capabilities**, not display options: they add the header controls **and** tell the Eloquent source to apply the request's sort/filter for that column. Because both map to the column **key**, a sortable/filterable key must be a real DB column (or an aliased `select`). Keep computed/accessor columns display-only.

```php
TextColumn::make('name')->sortable()->filterable();
```

## Custom data sources

For non-Eloquent data, extend `TableDefinition` and implement `source()` returning a `TableSource` — `query(TableQuery): TableResult`, `resolveMatching(TableQuery): Collection`, `resolveSelection(array $keys): Collection`. The quickest path is `CallbackTableSource`:

```php
public function source(): TableSource
{
    return new CallbackTableSource(
        fn (TableQuery $query) => TableResult::fromItems($this->rows($query)),
    );
}
```

Build a `TableResult` from a paginator (`TableResult::fromPaginator()`, `fromSimplePaginator()`) or a collection (`fromItems()`).

## Rendering on a page

Render with `Table::use(ProductsTable::class)` inside a page's component tree. `Table::lazy(ProductsTable::class)` renders the same table but defers the first data load until the component mounts — useful inside a tab or an off-screen section.

## Row & bulk actions

A table only *attaches* actions and their context; the action classes themselves are defined separately — see the **`lattice-actions`** skill.

- **Row actions** — return components from `actions(array $row)`: `Action::use(...)->context([...])` scoped to the record, plus plain `Link::make()->href(...)`.

  ```php
  use Lattice\Lattice\Actions\Components\Action;
  use Lattice\Lattice\Core\Components\Link;

  public function actions(array $row): array
  {
      return [
          Link::make('Edit')->href('/products/'.$row['id'].'/edit'),
          Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]),
      ];
  }
  ```

- **Bulk actions** — return `BulkAction::use(...)` from `bulkActions()`.

  ```php
  use Lattice\Lattice\Actions\Components\BulkAction;

  public function bulkActions(): array
  {
      return [BulkAction::use(ArchiveSelectedProductsAction::class)];
  }
  ```

  The bulk action's `handle(Collection $records, Request $request)` receives the selected **models** — with the Eloquent source, both explicit checks and "select all matching" (re-runs the current filters) are resolved for you, no extra code.

## Common mistakes

- **Making a computed/accessor column `sortable()`/`filterable()`** → it maps to a non-existent DB column. Keep it display-only or use a custom source.
- **Filtering/sorting by hand in `builder()`** → Lattice already applies the request's filters and sorts; `builder()` is only the base query.
- **No `#[AsTable('id')]` attribute** → the table is not discovered and has no endpoint.
