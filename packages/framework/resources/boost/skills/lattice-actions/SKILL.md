---
name: lattice-actions
description: Use when building or editing Lattice actions — creating ActionDefinition or BulkActionDefinition classes, returning effects from an ActionResult (toast, callout, redirect, reloadComponent, reloadPage, download, openModal, resetForm), flashing effects from controllers or listeners via Effects::flash(), adding confirmation modals or input forms to an action, grouping actions, authorizing them, or placing them on a page, a table row, or a table selection.
---

# Building Lattice actions

An action runs on the server in response to a click and returns **effects** the client dispatches — a toast, a redirect, a component or page refresh, opening a modal. It can both change data and drive the UI that follows. Actions are a discovered definition type addressed at `lattice/actions/{action}` (bulk: `lattice/bulk-actions/{bulkAction}`).

## Defining an action

Extend `ActionDefinition` with `definition()` (describe the trigger) and `handle()` (do the work, return an `ActionResult`). The `#[AsAction('id')]` attribute gives it a stable id — distinct from the `Action` component you build in `definition()`:

```php
use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\ButtonVariant;
use Lattice\Ui\Enums\Variant;

#[AsAction('app.products.archive')]
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
        $product = Product::findOrFail($this->context('product_id'));
        $product->update(['status' => 'archived']);

        return ActionResult::success()
            ->toast('Product archived.')
            ->reloadComponent('app.products');
    }
}
```

## The result and its effects

`handle()` returns an `ActionResult`. Start from `ActionResult::success($data?)` for a successful result, or `ActionResult::failure($message?)` to **reject** the action (HTTP 422; a message auto-adds an error toast and any open confirm dialog or modal stays open). Then chain effects (each returns a new result, so they read as a pipeline) — the client runs them in order:

| Effect | What it does |
| --- | --- |
| `->toast($message, $variant?)` | Show a toast. `$message` first, then an optional `Variant` (`Success` default, or `Danger`/`Warning`/`Info`). |
| `->callout($callout)` / `->retractCallout($key)` | Show a persistent in-flow banner in the layout's `Callouts::make()` slot (a `Callout` value object, `Lattice\Ui\Effects\Builtin\Callout`), or retract a previously-keyed one. |
| `->reloadComponent($id)` | Re-fetch one component — pass a `#[AsTable]`/component id so only it refreshes. |
| `->reloadPage()` | Reload the current page's props. |
| `->to($url)` / `->toRoute($name, $params?)` / `->back()` | Navigate to a URL, a named route, or back. |
| `->download($url)` | Trigger a file download. |
| `->openModal($id)` / `->closeModal($id?)` | Open/close a modal (`closeModal()` closes the current one). |
| `->resetForm($id?)` | Reset a form to its initial values (`resetForm()` resets the current form). |
| `->localeChange($locale)` | Switch the client's active locale. |
| `->toggleSidebar($target?)` | Toggle a layout sidebar open/closed. |

```php
return ActionResult::success()->toast('Saved.')->reloadComponent('app.products');
```

### Callout effect

`Callout::make(string $message, Variant $variant = Variant::Info)` builds a persistent banner. Chain `->title()`, `->dismissible()`, `->link()`, or `->action()` to configure it:

```php
use Lattice\Ui\Effects\Builtin\Callout;
use Lattice\Ui\Enums\Variant;

return ActionResult::success()
    ->callout(
        Callout::make('Your trial ends in 3 days.', Variant::Warning)
            ->title('Trial ending')
            ->link('Upgrade', '/billing')
    );
```

The callout renders in the layout slot `Callouts::make()` (placed between the header bar and `Outlet::make()` in the layout's `schema()`). A layout without that slot silently drops the callout.

Without `->unique($key)` a callout is a one-off event: it stays until dismissed. With a key it's a projection of server state — re-emit it on every request for which it still holds, and clear it with `->retractCallout($key)` (or flash `Callout::retract($key)`) once it no longer applies.

## Flashing effects from outside an action

`Effects::flash()` (facade `Lattice\Facades\Effects`) delivers any effect(s) with the next Inertia response — no `ActionResult` needed. Use from controllers, listeners, middleware, or anywhere a redirect is returned:

```php
use Lattice\Ui\Effects\Builtin\Callout;
use Lattice\Facades\Effects;
use Lattice\Ui\Enums\Variant;

Effects::flash(
    Effects::toast('Settings saved.', Variant::Success),
    Callout::make('Export is being processed.', Variant::Info)->title('Export queued')
);

return redirect('/dashboard');
```

`Effects::flash()` replaces the old `CreatesToastMessages` trait — migrate any `$this->toast(...)` calls to `Effects::flash(Effects::toast(...))`.

## Reading context

Reference an action anywhere a component is accepted with `Action::use(...)`, passing per-record data with `->context()`:

```php
Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]);
```

`handle()` reads it back with `$this->context('product_id')`. The context is **signed** into the action's reference, so it cannot be tampered with on the way back. Group related triggers behind one button with `ActionGroup::make('row')->actions([...])` (`Lattice\Actions\Components\ActionGroup`).

Register a key once with `Lattice::context('product', Product::class)` (or a closure resolver, `Lattice::context('product', fn (string $value) => Product::findOrFail($value))`) and `contextModel('product')` resolves it into the model — memoized per request (a resolver runs at most once, however many times it's read), aborting with a 404 when the key is absent or nothing matches. A registered key also cascades automatically into every child the action builds (a `->form([...])` field, a nested action) without re-passing it, and it can be placed as the model directly — `->context(['product' => $product])` normalizes it to the scalar before the ref seals.

## Confirmation and input forms

- `->confirm($title?, $description?, $confirmLabel?, $cancelLabel?)` shows a confirmation dialog before the action runs; `$title` defaults to the action's label when omitted.
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

For a subject ability (`can('update', $product)` rather than a subject-less one), declare it on the attribute instead: `#[AsAction('app.products.archive', can: 'update', on: 'product')]` checks the ability against the `product` context key's resolved value. A missing subject (the key absent, or its resolver finding nothing) denies outright rather than falling back to a subject-less check.

## Bulk actions

A bulk action runs over a table selection. Extend `BulkActionDefinition`; `handle()` receives the selected records as a `Collection`, resolved by the table's data source (Eloquent models for an `EloquentTableDefinition`). `definition()` returns the same `Action` component, so labels, variants, confirmation, and forms all apply.

```php
use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsBulkAction;

#[AsBulkAction('app.products.archive-selected')]
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
            ->toast("Archived {$records->count()} products.")
            ->reloadComponent('app.products');
    }
}
```

## Placing actions

- **On a table row:** return them from the table's `actions(array $row)` — `Action::use(...)->context(['product_id' => $row['id']])` (and plain `Link::make('Edit')->href(...)`).
- **On a table selection:** return `BulkAction::use(...)` (component `Lattice\Actions\Components\BulkAction`) from the table's `bulkActions()`.
- **Anywhere in a page tree:** `Action::use(...)` is a component like any other.

See the **`lattice-tables`** skill for the table wiring.

## Common mistakes

- **Confusing the attribute and the component** — `#[AsAction]`/`#[AsBulkAction]` live in `Lattice\Core\Attributes`; `Action::use()`/`BulkAction::use()` are components in `Lattice\Actions\Components`.
- **`reloadComponent()` with the wrong id** — pass the target component's `#[AsTable]`/component id, not the action's id.
- **Reading context off the raw request** — use `$this->context($key)`; it is the signed, trusted copy.
- **No `#[AsAction('id')]` / `#[AsBulkAction('id')]`** → the action is not discovered and has no endpoint.
- **Callout not appearing** — the active layout's `schema()` must include `Callouts::make()`; without it the effect is silently dropped.
- **Signalling failure with a 2xx** — return `ActionResult::failure('…')` (HTTP 422) to reject; a plain `success()` with an error toast still reads as success to the client and closes modals.
