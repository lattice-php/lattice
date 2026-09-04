---
name: lattice-closures
description: Use when writing a closure inside any Lattice field, action, filter, or extension point — computed field values, dependent fields, searchable selects, editable prefills, row/table filter callbacks, Lattice::extend() slots — or when adding a new Closure|T parameter to a custom Lattice API. Explains how Lattice resolves closure parameters by name and type via the Evaluate facade.
---

# Lattice closure evaluation

Many Lattice APIs accept `Closure|T` where a static value would be too limiting — computed field values, dependent fields, searchable selects, editable prefills, row labels, table filters. All of them resolve through the same evaluator, so a closure's **parameter names** (not just types) matter.

## Resolution order

Each parameter is resolved in this order:

1. A named utility with the same parameter name (`$state`, `$get`, `$value`, `$component`, `$search`, `$row`, `$form`, …).
2. A typed utility registered in the current `EvaluationContext`.
3. A typed utility whose object is an instance of the requested parent class or interface.
4. Laravel's container, for any resolvable class or interface.
5. The parameter's default value, or `null` when it's nullable.

An unmatched, non-nullable parameter throws — the exception lists the named utilities actually available to that closure.

**Named beats typed**: `fn ($state)` and `fn (FormData $state)` both receive the same object — the type annotation documents it but doesn't drive resolution. Name your parameters after the utility you want, even when you also add a type hint.

```php
TextInput::make('slug', 'Slug')->value(fn (FormData $state) => Str::slug($state->string('name')));
```

## Field utilities

Every field callback (dynamic rules, computed `->value()`, `->dependsOn()`) shares this base context:

| Utility | Resolves to |
| --- | --- |
| `$state` / typed `FormData` | The current scope — the whole form for a normal field, the row for a repeater/builder row hook. |
| `$get($key, $default)` | Reads another field's value from the current scope. |
| `$value` | This field's own current value. |
| `$component` / a typed field parameter | The live field instance — `fn (TextInput $field)` or any ancestor type; a mismatched type throws rather than constructing a fresh one (fields are never autowired). |
| `Request $request` | The current request. |
| Any container type | Resolved from Laravel's container. |

```php
TextInput::make('total', 'Total')->dependsOn(
    ['qty', 'price'],
    fn (TextInput $field, FormData $state) => $field->value($state->float('qty') * $state->float('price')),
);
```

## Hook-specific utilities

| Hook | Extra utilities |
| --- | --- |
| `Select::searchable()` | `$search`, the query string. |
| `Select::resolveSelectedUsing()` | `$values`, the selected value list, plus `$component`. |
| `->value($closure, editable: true)` — an editable prefill, not the plain read-only computed variant | `$row` and `$form`, like row hooks. |
| `Repeater`/`Builder` row callbacks (e.g. `->itemLabel()`) | `$row` for the current row, `$form` for the whole form — a typed `FormData` parameter binds to `$row`. |
| `ToggleFilter::query()` | A typed Eloquent `Builder`, `$value` (the toggle state). |
| `TernaryFilter::queries()` / a custom `Filter::apply()` | A typed Eloquent `Builder`. |
| `Lattice::extend()` slot closures | Named slot context, typed context objects, `$user`, `$slot`/typed `Slot`, typed `Request`. |
| `Lattice::context()` resolver | `$value` (the raw context scalar), `$key`, `$context` (the definition's full raw context array — read another key), typed `Request`. |
| `Lattice::context()` `keyBy` (turns the resolved object back into its wire scalar) | `$value` or the resolved object's own type, `$key`, typed `Request`. |

```php
Select::make('author_id', 'Author')
    ->searchable(fn (string $search, Request $request) => User::query()
        ->where('team_id', $request->user()->current_team_id)
        ->where('name', 'like', "%{$search}%")
        ->limit(10)->get()
        ->map(fn (User $user) => Select::option($user->name, (string) $user->id))->all());

Repeater::make('lines')
    ->itemLabel(fn (FormData $row, FormData $form) => $row->string('name') ?: $form->string('currency'));

Lattice::context('product', function (string $value, Request $request): Product {
    return Product::where('slug', $value)->firstOrFail();
});
```

## Server-side timing

Evaluation is server-side only — a closure runs on render, validate, submit, dependent-field resolve, or a select/table round-trip. For **live**, client-side cross-field reactivity, use the declarative condition DSL instead: `visibleWhen()`/`requiredWhen()`/`disabledWhen()`/`readOnlyWhen()`. Those serialize to the client and are re-checked on the server.

## Adding a new closure hook

Accept `Closure|T`, resolve it at the moment the value is needed:

```php
use Lattice\Core\Facades\Evaluate;

$resolved = Evaluate::resolve(
    $value,
    Evaluate::context()->named('value', $currentValue)->typed(Request::class, $request),
);
```

For a form-field-scoped hook, start from the field's own `evaluationContext()` and extend it with `->named(...)` so `$state`, `$get`, `$value`, `$component`, and typed `FormData`/`Request`/component injection all stay consistent with every other field callback.

## Common mistakes

- **Naming a parameter after its type instead of the utility** (e.g. `fn ($query)` on a searchable select) — resolution is name-first; `Select::searchable()` binds the query string under `$search`, not `$query`. An unmatched name throws.
- **Expecting a fresh component instance from a mismatched typed parameter** — Lattice never autowires components from the container; type-hint the field's actual class or an ancestor, or use the untyped `$component`.
- **Reaching for a closure for live client-side reactivity** — closures only run server-side per request; use `visibleWhen`/`requiredWhen`/`disabledWhen`/`readOnlyWhen` for anything that must react instantly in the browser.
