---
name: lattice-forms
description: Use when building or editing Lattice forms in a Laravel + Inertia app — creating FormDefinition classes, adding fields (TextInput, Select, Checkbox, Choice, DateInput, NumberInput, RichEditor, Repeater), writing server-side or live Precognition validation, conditional or computed fields, rendering a form on a page with Form::use(), or handling submissions.
---

# Building Lattice forms

A Lattice form is a PHP class that declares its fields and handles its own submission. You define the schema once; Lattice renders the React inputs, posts to a dedicated **signed** endpoint, validates with Laravel (live, via Precognition), and runs your handler. Validation and conditions run on the server, so the client cannot bypass them.

## Defining a form

Extend `FormDefinition` and implement `definition()` (build the schema) and `handle()` (process a valid submit). The `#[Form('id')]` attribute gives a stable id so the form is discovered and addressed at `lattice/forms/{form}`.

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

The schema accepts fields and layout containers (`Card`, `Grid`, `Stack`) in any nesting.

## Fields

Built-in fields live in `Lattice\Lattice\Forms\Components`: `TextInput`, `Textarea`, `Select`, `Choice`, `Checkbox`, `DateInput`, `NumberInput`, `PasswordInput`, `HiddenInput`, `RichEditor`, `Repeater`. Create one with `Field::make('name', 'Label')` (label optional).

Options shared by **every** field (they extend the base `Field`):

| Method | Effect |
| --- | --- |
| `->value($v)` | Default value. A `fill()`ed / record value wins over it. |
| `->helperText($t)` / `->hint($t)` | Muted help line below the input. |
| `->required()` | Required indicator + `required` rule. |
| `->rules([...])` | Laravel validation rules for this field. |
| `->disabled()` | Non-interactive **and not submitted**. |
| `->readOnly()` | Shown, not editable, **still submitted**. |
| `->hidden()` / `->visible($bool)` | Remove / show the field. |

### Select and Choice options

`Select` (a dropdown) and `Choice` (inline radio-style, for a handful of options) are populated the same way — `->options([...])` of label/value pairs built with the field's own `option()` helper, or `->enum()` from a backed enum:

```php
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Select;

Select::make('status', 'Status')
    ->placeholder('Pick a status')
    ->options([
        Select::option('Active', 'active'),
        Select::option('Archived', 'archived'),
    ]);

Select::make('status', 'Status')->enum(Status::class);   // backed enum; labels from HasLabel or humanized case
Select::make('languages', 'Languages')->multiple();      // submits an array

Choice::make('plan', 'Plan')->options([
    Choice::option('Free', 'free'),
    Choice::option('Pro', 'pro'),
]);
```

For large datasets make the select server-driven with `->searchable()`; the closure gets the query (plus `FormData` and `Request`) and returns options. On an edit form, add `->resolveSelectedUsing()` so the stored value(s) resolve back to labels:

```php
Select::make('author_id', 'Author')
    ->searchable(fn (string $query) => User::query()
        ->where('name', 'like', "%{$query}%")->limit(10)->get()
        ->map(fn (User $u) => Select::option($u->name, (string) $u->id))->all())
    ->resolveSelectedUsing(fn (array $values) => User::query()
        ->whereIn('id', $values)->get()
        ->map(fn (User $u) => Select::option($u->name, (string) $u->id))->all());
```

## Validation

Attach Laravel rules per field with `->rules([...])` (or `->required()`). In `handle()`, call `$this->validate($request)` — it runs the field rules and returns the validated, cast data as an array (**visible-only**; hidden and disabled values are stripped).

Turn on **live validation** by calling `->precognitive(500)` (debounce ms) in `definition()`. It validates as the user types using the exact same ruleset — nothing to keep in sync.

```php
return $form
    ->precognitive(500)
    ->schema([/* … */]);
```

Where a callback needs in-flight form state (dynamic rules, dependent fields), it receives a `FormData` object with typed accessors: `$data->string('name')`, `->boolean('subscribe')`, `->integer('qty')`, `->float('price')`, `->get('tags', [])`.

## Conditional & computed fields

Fields react to other fields. Each method names the field to watch, an optional operator, and the value to compare:

```php
TextInput::make('vat', 'VAT ID')->visibleWhen('type', 'business');
TextInput::make('vat', 'VAT ID')->requiredWhen('country', 'DE');
TextInput::make('coupon')->readOnlyWhen('plan', 'enterprise');
TextInput::make('coupon')->disabledWhen('billing', 'invoice');
```

Pass an array to match any value (`->visibleWhen('country', ['DE', 'AT', 'CH'])`), or an operator string / `Lattice\Lattice\Core\Enums\Op` case as the middle argument (`->requiredWhen('age', '<', 18)`). Operators include `=`, `!=`, `>`, `<`, `contains`, `starts_with`, `in`, `empty`, `before`/`after`. Conditions are evaluated on the client **and** re-checked on the server.

Compute a value from the form data instead of typing it:

```php
TextInput::make('total', 'Total')
    ->value(fn (FormData $data) => $data->float('qty') * $data->float('price'));
```

To also change the field when its inputs change, name them with `->dependsOn()`:

```php
TextInput::make('total', 'Total')->dependsOn(
    ['qty', 'price'],
    fn (TextInput $field, FormData $data) => $field->value($data->float('qty') * $data->float('price')),
);
```

## Rendering on a page

Render with `Form::use(MyForm::class)` inside a page's component tree, configured fluently:

```php
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\Form;

Form::use(ProfileForm::class)
    ->method(HttpMethod::Patch)   // post by default
    ->submitLabel('Save changes')
    ->fill(['name' => $user->name, 'email' => $user->email])  // seeds an edit form
    ->context(['user_id' => $user->id]);                      // extra data handle() can read
```

The form renders its own submit button (disabled while submitting or while there are errors, with a spinner). To place it yourself, call `->withoutSubmitButton()` and add `Button::make('Save')->submit()` in the schema.

## Submit lifecycle

Every form posts to its signed endpoint; `FormController` routes the request: a searchable `Select` **search** returns options; a dependent-field **resolve** returns updated nodes/values; a **precognitive** request validates and returns `204`/`422` without running `handle()`; otherwise it validates and calls `handle()`. `handle()` may return any Laravel `Response`/`Responsable` — a redirect, JSON, or a toast effect via `ActionResult`.

## Common mistakes

- **No `#[Form('id')]` attribute** → the form is not discovered and has no endpoint.
- **Validating only in `handle()`** instead of per-field `->rules()` → no live validation; the client can't reflect the rules.
- **Expecting `disabled()` values in the validated data** — they are stripped. Use `->readOnly()` when the value must still be submitted.
- **Relying on a conditionally hidden field's value** — a field hidden by `visibleWhen` (or `->hidden()`) is stripped from `validate()`'s result, so it is absent from the array. Default it in `handle()` if you still need a value.
- **Changing a `#[Form]` id later** → breaks already-rendered references.

Need an action behind a button, a row, or a selection? See the **`lattice-actions`** skill.
