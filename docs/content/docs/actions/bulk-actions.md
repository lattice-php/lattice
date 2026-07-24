---
title: Bulk actions
description: Actions that run over a table selection, receiving the selected records.
---

A bulk action runs over the rows selected in a [table](/tables/actions/#bulk-actions). It works like a
regular action, except `handle()` receives the selected records as a collection.

## Defining a bulk action

Extend `BulkActionDefinition` and implement `definition()` and `handle()`. The `#[AsBulkAction]`
attribute registers it.

```php
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Ui\Enums\Variant;

#[AsBulkAction('app.products.archive-selected')]
class ArchiveSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label('Archive selected')
            ->variant(Variant::Danger);
    }

    public function handle(Collection $records, Request $request): ActionResult
    {
        $records->each(fn (Product $product) => $product->update(['status' => 'archived']));

        return ActionResult::success(['archived' => $records->count()])
            ->toast("Archived {$records->count()} products.", Variant::Success)
            ->reloadComponent('app.products');
    }
}
```

`definition()` returns the same `Action` component as a single action, so labels, variants,
[confirmation](/actions/confirmation-and-forms/), and [forms](/actions/confirmation-and-forms/#collecting-input-with-a-form)
all apply. `handle()` returns an [`ActionResult`](/actions/effects/) like any action.

## Attaching it to a table

Return bulk actions from a table's `bulkActions()`:

```php
use Lattice\Lattice\Actions\Components\BulkAction;

public function bulkActions(): array
{
    return [
        BulkAction::use(ArchiveSelectedProductsAction::class),
    ];
}
```

When at least one row is selected, the table shows a bulk action bar.

## How records are resolved

The collection passed to `handle()` is resolved by the table's
[data source](/tables/data-sources/) — both an explicit set of checked rows and "select all
matching", which re-runs the current filters on a signed [endpoint](/advanced/security/). With the
[Eloquent source](/tables/eloquent-tables/#selecting-bulk-action-rows) this needs no extra code: the
records arrive as models, ready to act on.
