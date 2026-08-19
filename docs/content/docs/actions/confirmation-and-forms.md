---
title: Confirmation & forms
description: Confirm an action before it runs, or collect validated input in a modal and pass it to handle().
---

An action can interrupt the click with a modal — either a simple confirmation, or a full form whose
values are passed to `handle()`.

Both dialogs render through the app's shared [modal host](/components/modals/#stacking): they
survive the popover or kebab menu that triggered them closing, and they open above whatever modal
is already open — a row action's confirmation above the modal that contains its table, for
instance.

## Confirmation modals

`->confirm()` shows a confirmation dialog before the action runs. The user must accept; cancelling
does nothing. Pass a title and, optionally, a description and custom button labels.

```php
public function definition(Action $action): Action
{
    return $action
        ->label('Archive')
        ->variant(Variant::Danger)
        ->confirm(
            'Archive product?',
            'This hides it from the catalogue.',
            confirmLabel: 'Archive',
            cancelLabel: 'Keep',
        );
}
```

## Collecting input with a form

`->form()` renders a [form](/forms/overview/) in a modal before the action runs. The collected values
are posted to the [action endpoint](/advanced/security/) and validated server-side, then `handle()` reads them. Use it for
"reject with a reason", "assign a category", and the like.

```php
use Lattice\Form\Components\Select;
use Lattice\Form\Components\Textarea;

public function definition(Action $action): Action
{
    return $action
        ->label('Reject')
        ->variant(Variant::Danger)
        ->confirm('Reject product?', 'Tell the seller why.', 'Submit rejection')
        ->form([
            Textarea::make('reason', 'Reason')->required()->rules(['string', 'max:255']),
            Select::make('replacement', 'Suggested replacement')->rules(['nullable']),
        ]);
}
```

The form fields are the same `Field` builders used everywhere, so [validation](/forms/validation/),
[conditions](/forms/conditional-fields/), and searchable selects all work. Validation is precognitive
by default — the modal validates as the user types.

Declare `FormData $data` on `handle()` to receive the validated, cast values — the endpoint
validates before calling you, so there's nothing to trigger yourself:

```php
public function handle(FormData $data, Request $request): ActionResult
{
    $this->product($request)->update(['status' => 'rejected']);

    return ActionResult::success()
        ->toast("Rejected: {$data->string('reason')}")
        ->reloadComponent('app.products');
}
```

### Sheet presentation and width

A form modal opens as a centered dialog at the default width. `->slideOut()` presents it as a
full-height sheet docked to a viewport edge, and `->modalWidth()` adjusts its width on the same
scale the [Modal component](/components/modals/) uses:

```php
use Lattice\Ui\Enums\ModalWidth;

public function definition(Action $action): Action
{
    return $action
        ->label('Edit')
        ->slideOut()
        ->modalWidth(ModalWidth::Xl)
        ->form([
            // …
        ]);
}
```

### Deferring the schema

By default the form schema ships inline with the action. For a per-record form — one prefilled from
the row it acts on — call `->lazyForm()`. The action ships a flag instead of the schema, and the
client fetches the prefilled form from the action endpoint when the modal opens.

```php
$action->lazyForm()->form([/* … */]);
```

### Building the schema per request

`->lazyForm()->form([...])` ships a fixed schema that the client fetches on open. When the schema
itself needs the request — to prefill from the record being acted on, or to vary fields by user —
extend `FormActionDefinition` instead and build it in `formSchema()`:

```php
use Lattice\Actions\FormActionDefinition;
use Lattice\Form\Components\Form;
use Lattice\Form\FormData;
use Illuminate\Http\Request;

#[AsAction('products.edit')]
final class EditProduct extends FormActionDefinition
{
    public function formSchema(Form $form, Request $request): Form
    {
        $product = $this->product($request);

        return $form->schema([
            TextInput::make('name', 'Name')->value($product->name),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        // …
    }
}
```

Lattice marks these actions lazy automatically and fetches the schema from the trusted record context
on open, so the prefilled values never ship in the page payload. You can also delegate to an existing
[`FormDefinition`](/forms/overview/): `return app(MyForm::class)->definition($form, $request);`.

Confirmation and forms compose with everything else: the same action still returns
[effects](/actions/effects/) from `handle()`, and still runs its [authorization](/actions/overview/#authorization) check first.
