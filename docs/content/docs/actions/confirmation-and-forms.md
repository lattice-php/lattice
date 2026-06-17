---
title: Confirmation & forms
description: Confirm an action before it runs, or collect validated input in a modal and pass it to handle().
---

An action can interrupt the click with a modal — either a simple confirmation, or a full form whose
values are passed to `handle()`.

## Confirmation modals

`->confirm()` shows a confirmation dialog before the action runs. The user must accept; cancelling
does nothing. Pass a title and, optionally, a description and custom button labels.

```php
public function definition(Action $action): Action
{
    return $action
        ->label('Archive')
        ->variant(ButtonVariant::Destructive)
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
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\Textarea;

public function definition(Action $action): Action
{
    return $action
        ->label('Reject')
        ->variant(ButtonVariant::Destructive)
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

In `handle()`, call `$this->validate($request)` to get the validated, cast values:

```php
public function handle(Request $request): ActionResult
{
    $data = $this->validate($request);

    $this->product($request)->update(['status' => 'rejected']);

    return ActionResult::success()
        ->toast("Rejected: {$data['reason']}")
        ->reloadComponent('app.products');
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
use Lattice\Lattice\Actions\FormActionDefinition;
use Lattice\Lattice\Forms\Components\Form;
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

    public function handle(Request $request): ActionResult
    {
        $data = $this->validate($request);
        // …
    }
}
```

Lattice marks these actions lazy automatically and fetches the schema from the trusted record context
on open, so the prefilled values never ship in the page payload. You can also delegate to an existing
[`FormDefinition`](/forms/overview/): `return app(MyForm::class)->definition($form, $request);`.

Confirmation and forms compose with everything else: the same action still returns
[effects](/actions/effects/) from `handle()`, and still runs its [authorization](/actions/overview/#authorization) check first.
