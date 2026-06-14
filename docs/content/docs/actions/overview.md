---
title: Actions
description: Server-run actions that respond to a click and return effects — toasts, redirects, refreshes, and modals — to the client.
---

An action runs on the server in response to a click and returns **effects** the client dispatches: a
toast, a redirect, a component or page refresh, opening a modal. An action can both change data and
drive the UI that follows.

## Defining an action

Extend `ActionDefinition` and implement two methods: `definition()` describes the trigger (label,
icon, variant, confirmation), and `handle()` runs the work and returns an `ActionResult`. The
`#[Action]` attribute gives the action a stable id so it can be discovered and addressed by its
[endpoint](/advanced/security/).

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

## Placing an action

Reference an action anywhere a component is accepted with `Action::use()`. The most common spot is a
table's [row actions](/tables/actions/), where `->context()` scopes it to the record:

```php
Action::use(ArchiveProductAction::class)
    ->context(['product_id' => $row['id']]);
```

`context()` carries data from the page to the action; `handle()` reads it back with
`$this->context($request, 'product_id')`. The context is signed into the action's reference, so it
can't be tampered with on the way back.

Group related actions behind a single trigger with `ActionGroup`:

```php
use Lattice\Lattice\Actions\Components\ActionGroup;

ActionGroup::make('row-actions')->actions([
    Action::use(EditProductAction::class)->context(['product_id' => $row['id']]),
    Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]),
]);
```

Render the same group inline when the actions should stay visible:

```php
use Lattice\Lattice\Core\Enums\Orientation;

ActionGroup::make('locale-switcher')
    ->label('Language')
    ->inline(Orientation::Horizontal)
    ->actions([
        Action::use(SetLocaleAction::class)->context(['locale' => 'en']),
        Action::use(SetLocaleAction::class)->context(['locale' => 'de']),
    ]);
```

## The result

`handle()` returns an `ActionResult`. Start from `ActionResult::success()` or
`ActionResult::failure()`, optionally attaching data, then chain [effects](/actions/effects/):

```php
return ActionResult::success(['id' => $product->id])
    ->toast('Saved.')
    ->reloadComponent('app.products');
```

## Authorization

Override `authorize()` to gate an action. It receives the request (with the trusted context merged
in) and returns a boolean; a denied action never reaches `handle()`.

```php
public function authorize(Request $request): bool
{
    return $this->product($request)->status !== 'archived';
}
```

## Next steps

- [Effects & results](/actions/effects/) — every effect an action can return.
- [Confirmation & forms](/actions/confirmation-and-forms/) — confirmation modals and collecting input before running.
- [Bulk actions](/actions/bulk-actions/) — acting on a table selection.
