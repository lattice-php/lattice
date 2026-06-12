---
name: lattice-actions
description: Use when building or editing Lattice actions — creating ActionDefinition or BulkActionDefinition classes, returning effects from an ActionResult (toast, redirect, reloadComponent, reloadPage, download, openModal, resetForm), adding confirmation modals or input forms to an action, grouping actions, authorizing them, or placing them on a page, a table row, or a table selection.
---

# Building Lattice actions

An action runs on the server in response to a click and returns **effects** the client dispatches — a toast, a redirect, a component or page refresh, opening a modal. It can both change data and drive the UI that follows. Actions are a discovered definition type addressed at `lattice/actions/{action}` (bulk: `lattice/bulk-actions/{bulkAction}`).

## Defining an action

Extend `ActionDefinition` with `definition()` (describe the trigger) and `handle()` (do the work, return an `ActionResult`). The `#[Action('id')]` attribute gives it a stable id. Note the import alias — the attribute and the `Action` component share a name:

```php
use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\Action as ActionAttribute;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\ToastVariant;

#[ActionAttribute('app.products.archive')]
class ArchiveProductAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label('Archive')
            ->variant(ButtonVariant::Destructive)
            ->confirm('Archive product?', 'This hides it from the catalogue.');
    }

    public function handle(Request $request): ActionResult
    {
        $product = $this->product($request);
        $product->update(['status' => 'archived']);

        return ActionResult::success()
            ->toast(ToastVariant::Success, 'Product archived.')
            ->reloadComponent('app.products');
    }
}
```

## The result and its effects

`handle()` returns an `ActionResult`. Start from `ActionResult::success($data?)` or `ActionResult::failure($data?)`, then chain effects (each returns a new result, so they read as a pipeline) — the client runs them in order:

| Effect | What it does |
| --- | --- |
| `->toast($message, $variant?)` | Show a toast (`ToastVariant::Success`/`Error`/`Warning`/`Info`; defaults to success; message and variant are order-insensitive). |
| `->reloadComponent($id)` | Re-fetch one component — pass a `#[Table]`/component id so only it refreshes. |
| `->reloadPage()` | Reload the current page's props. |
| `->redirect($url)` | Navigate to a URL. |
| `->download($url)` | Trigger a file download. |
| `->openModal($id)` / `->closeModal($id?)` | Open/close a modal (`closeModal()` closes the current one). |
| `->resetForm($id?)` | Reset a form to its initial values (`resetForm()` resets the current form). |

```php
return ActionResult::success()->toast('Saved.')->reloadComponent('app.products');
```

## Reading context

Reference an action anywhere a component is accepted with `Action::use(...)`, passing per-record data with `->context()`:

```php
Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]);
```

`handle()` reads it back with `$this->context($request, 'product_id')`. The context is **signed** into the action's reference, so it cannot be tampered with on the way back. Group related triggers behind one button with `ActionGroup::make('row')->actions([...])` (`Lattice\Lattice\Actions\Components\ActionGroup`).

## Confirmation and input forms

- `->confirm($title, $description?, $confirmLabel?, $cancelLabel?)` shows a confirmation dialog before the action runs.
- `->form([...])` renders a [form](#) in a modal first; its values post to the action endpoint, validate server-side (precognitive by default), and are read in `handle()` with `$this->validate($request)`. Use the same `Field` builders as any form. Use `->lazyForm()->form([...])` for a per-record form prefilled from the row when the modal opens.

```php
return $action
    ->label('Reject')
    ->variant(ButtonVariant::Destructive)
    ->confirm('Reject product?', 'Tell the seller why.', 'Submit')
    ->form([
        Textarea::make('reason', 'Reason')->required()->rules(['string', 'max:255']),
    ]);
```

## Authorization

Override `authorize(Request $request): bool` to gate an action; the trusted context is already merged in. A denied action never reaches `handle()`.

## Bulk actions

A bulk action runs over a table selection. Extend `BulkActionDefinition`; `handle()` receives the selected models as a `Collection`. `definition()` returns the same `Action` component, so labels, variants, confirmation, and forms all apply.

```php
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\BulkAction as BulkActionAttribute;

#[BulkActionAttribute('app.products.archive-selected')]
class ArchiveSelectedProductsAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Archive selected')->variant(ButtonVariant::Destructive);
    }

    public function handle(Collection $records, Request $request): ActionResult
    {
        $records->each(fn (Product $product) => $product->update(['status' => 'archived']));

        return ActionResult::success(['archived' => $records->count()])
            ->toast(ToastVariant::Success, "Archived {$records->count()} products.")
            ->reloadComponent('app.products');
    }
}
```

## Placing actions

- **On a table row:** return them from the table's `actions(array $row)` — `Action::use(...)->context(['product_id' => $row['id']])` (and plain `Link::make('Edit')->href(...)`).
- **On a table selection:** return `BulkAction::use(...)` (component `Lattice\Lattice\Actions\Components\BulkAction`) from the table's `bulkActions()`.
- **Anywhere in a page tree:** `Action::use(...)` is a component like any other.

See the **`lattice-tables`** skill for the table wiring.

## Common mistakes

- **Confusing the attribute and the component** — `#[Action]`/`#[BulkAction]` live in `Lattice\Lattice\Attributes` (alias them on import); `Action::use()`/`BulkAction::use()` are components in `Lattice\Lattice\Actions\Components`.
- **`reloadComponent()` with the wrong id** — pass the target component's `#[Table]`/component id, not the action's id.
- **Reading context off the raw request** — use `$this->context($request, $key)`; it is the signed, trusted copy.
- **No `#[Action('id')]` / `#[BulkAction('id')]`** → the action is not discovered and has no endpoint.
