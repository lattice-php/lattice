---
title: Forms
description: Define fields in PHP, render them with Inertia, and validate on a dedicated server endpoint — live, through Precognition.
---

A form is a PHP class that declares its fields and handles its own submission. You define the schema
once; Lattice renders the React inputs, posts to a dedicated [endpoint](/advanced/security/), validates with Laravel, and
runs your handler. Validation runs live as the user types, using the exact same rules.

## Defining a form

Extend `FormDefinition` and implement two methods: `definition()` builds the field schema, and
`handle()` processes a valid submission. The `#[Form]` attribute gives the form a stable id so it can
be discovered and addressed by its own endpoint.

```php
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('app.profile.form')]
class ProfileForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            TextInput::make('name', 'Name')->rules(['required', 'string', 'max:255']),
            TextInput::make('email', 'Email')->email()->rules(['required', 'email']),
        ]);
    }

    public function handle(Request $request): Response
    {
        $validated = $this->validate($request);

        $request->user()->update($validated);

        return redirect('/profile');
    }
}
```

The schema accepts fields and layout containers (`Card`, `Grid`, `Stack`) in any nesting — see
[Fields](/forms/fields/overview/) for the field types and [Components](/core/components/) for layout.

## Rendering a form

Render a form on a page with `Form::use()`, passing the definition class. Configure it fluently:

```php
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\Form;

Form::use(ProfileForm::class)
    ->method(HttpMethod::Patch)
    ->submitLabel('Save changes')
    ->fill([
        'name' => $user->name,
        'email' => $user->email,
    ]);
```

- `->fill()` seeds the fields for an edit form. A field's filled value wins over its `->value()`
  default, and fields can react to it (a `Select` resolves stored ids to labels, for example).
- `->method()` sets the HTTP verb the form submits with (`post` by default).
- `->submitLabel()` sets the submit button's text.
- `->context()` passes extra data (such as the record id) that `handle()` can read back.

## The submit lifecycle

Every form posts to its own endpoint, resolved from its `#[Form]` id. The request is signed, so a
form only accepts submissions for the schema it actually rendered. `FormController` routes the request:

1. A **search** request (a searchable `Select` fetching options) returns matching options.
2. A **resolve** request (a [dependent field](/forms/conditional-fields/) recomputing) returns the
   updated field nodes and values.
3. A **precognitive** request validates and returns `204`/`422` without running `handle()`.
4. Otherwise the submission is validated and passed to `handle()`.

`$this->validate($request)` runs the field rules and returns the validated, cast data as an array —
visible-only, with hidden and disabled values stripped. Your `handle()` returns any Laravel
`Response` or `Responsable`: a redirect, a JSON payload, or a [toast effect](/actions/overview/).

## Working with submitted data

`validate()` returns a plain array of validated values. Where a callback needs to read the in-flight
form state — [dynamic rules](/forms/validation/#dynamic-rules) and
[dependent fields](/forms/conditional-fields/) — it receives a `FormData` object with typed
accessors:

```php
$data->string('name');
$data->boolean('subscribe');
$data->integer('quantity');
$data->float('price');
$data->get('tags', []);
```

## Live validation with Precognition

Call `->precognitive()` in the definition to validate as the user types, through
[Laravel Precognition](https://laravel.com/docs/precognition). The form sends a debounced request
that runs your rules and returns messages without executing `handle()`. Because it is the same
server-side ruleset, there is nothing to keep in sync.

```php
public function definition(FormComponent $form, Request $request): FormComponent
{
    return $form
        ->precognitive(500) // debounce in milliseconds
        ->schema([/* … */]);
}
```

See [Validation](/forms/validation/) for the full rule surface.

## The submit button

The form renders its submit button for you, labelled by `->submitLabel()`. It is form-aware: it
disables while submitting and while there are validation errors, and shows a spinner — the heading of
that error summary is set with `->validationSummaryLabel()` (default "Fix these fields to continue:").
To take over
placement — render the button somewhere other than the form footer — call `->withoutSubmitButton()`
and place a [`Button`](/core/components/) with `->submit()` in the schema yourself:

```php
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Enums\ButtonVariant;

Button::make('Create account')->submit()->variant(ButtonVariant::Default);
```

## Next steps

- [Fields](/forms/fields/overview/) — every field type and the options they share.
- [Validation](/forms/validation/) — rules, messages, and live validation.
- [Conditional fields](/forms/conditional-fields/) — show, require, or compute fields from other fields.
