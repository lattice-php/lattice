---
title: Actions
description: Per-row actions and bulk actions on selected rows.
---

Tables carry two kinds of actions: **row actions** rendered per row, and **bulk actions** that operate
on the selected rows. Both reuse Lattice's [Actions](/actions/overview/) — the table only decides
which actions to attach and with what context.

## Row actions

Override `actions()` to return the components shown in each row's action column. It receives the row
data, so you can build links and actions scoped to that record:

```php
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Ui\Components\Link;

public function actions(array $row): array
{
    return [
        Link::make('Edit')->href('/products/'.$row['id'].'/edit'),
        Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $row['id']]),
    ];
}
```

- `Link` navigates, like any other link.
- `Action::use()` references an action class and runs it through the [action endpoint](/advanced/security/). Pass per-row
  data with `->context()`; the action reads it back when it handles the request.

The row is a plain array of the serialized row values, so `$row['id']` (and any other selected column)
is available to scope the action.

## Bulk actions

Override `bulkActions()` to return actions that apply to a selection. When at least one row is
selected, the table shows a bulk action bar; running an action passes the selected rows to the action's
handler.

```php
use Lattice\Lattice\Actions\Components\BulkAction;

public function bulkActions(): array
{
    return [
        BulkAction::use(ArchiveSelectedProductsAction::class),
    ];
}
```

The selection is resolved by the table's [data source](/tables/data-sources/) — both an
explicit set of checked rows and "select all matching", which re-runs the current filters. With the
[Eloquent source](/tables/eloquent-tables/#selecting-bulk-action-rows) this works with no extra code.

See [Actions](/actions/overview/) for defining the action and bulk-action classes themselves —
including confirmation modals and the effects an action can return.
