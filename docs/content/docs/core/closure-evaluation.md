---
title: Closure evaluation
description: How Lattice resolves closure parameters by name, type, and the Laravel container.
---

Many Lattice APIs accept a closure where a static value would be too limiting: dynamic validation
rules, computed field values, dependent fields, searchable selects, row labels, and table filters all
use the same evaluator.

Closures are resolved through the `Lattice\Lattice\Facades\Evaluate` facade. Non-closure values pass
through unchanged, so an API can accept `Closure|T` and resolve both forms consistently.

## Resolution order

Each closure parameter is resolved in this order:

1. A named utility with the same parameter name.
2. A typed utility registered in the current `EvaluationContext`.
3. A typed utility whose object is an instance of the requested parent class or interface.
4. The Laravel container, for any resolvable class or interface.
5. The parameter default value, or `null` when the parameter allows it.

If none of those match, Lattice throws an exception that lists the named utilities available to that
closure.

Named utilities win before type resolution. This is why `fn ($state)` receives the named form state
even without a type — and `fn (FormData $state)` receives that same object because the name matches
first; the type annotation documents it rather than driving the resolution.

```php
TextInput::make('slug', 'Slug')
    ->value(fn (FormData $state) => Str::slug($state->string('name')));
```

## Field utilities

Field callbacks share a base context. It is used by dynamic rules, computed values, `dependsOn()`
callbacks, and searchable select resolvers.

| Utility                 | Resolves to                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `$state`                | The current `FormData` scope. For normal fields this is the form; for row hooks this is the row. |
| `$get($key, $default)`  | A helper that reads from the current `FormData` scope.                                           |
| `$value`                | The current field's own value from the current scope.                                            |
| `$component`            | The live field instance.                                                                         |
| `FormData $data`        | The current `FormData` scope.                                                                    |
| `Request $request`      | The current request.                                                                             |
| Any container type      | A service resolved from Laravel's container.                                                     |
| The field class by type | The live field instance, when the type matches the concrete field or one of its parent classes.  |

```php
TextInput::make('total', 'Total')
    ->dependsOn(
        ['qty', 'price'],
        fn (TextInput $component, FormData $state) => $component
            ->value($state->float('qty') * $state->float('price')),
    );
```

`$component` and a typed field parameter point at the same live object. Lattice never autowires
component classes from the container, so a mismatched component type is treated as unresolved instead
of constructing a fresh component.

## Hook-specific utilities

Some callbacks add more named utilities:

| Hook                               | Extra utilities                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Select::searchable()`             | `$search`, the query string.                                                                       |
| `Select::resolveSelectedUsing()`   | `$values`, the selected value list, plus `$component`.                                             |
| Repeater and builder row callbacks | `$row` for the current row and `$form` for the whole form. A typed `FormData` parameter is `$row`. |
| `ToggleFilter::query()`            | A typed Eloquent `Builder` and `$value`, the submitted toggle state.                               |
| `TernaryFilter::queries()`         | A typed Eloquent `Builder`.                                                                        |

```php
Select::make('author_id', 'Author')
    ->searchable(fn (string $search, Request $request) => User::query()
        ->where('team_id', $request->user()->current_team_id)
        ->where('name', 'like', "%{$search}%")
        ->limit(10)
        ->get()
        ->map(fn (User $user) => Select::option($user->name, (string) $user->id))
        ->all());
```

Inside row hooks, use the named `$form` utility when you need values outside the row:

```php
Repeater::make('lines')
    ->itemLabel(fn (FormData $row, FormData $form) => $row->string('name') ?: $form->string('currency'));
```

## Server-side timing

Closure evaluation is server-side. A closure runs when Lattice renders, validates, submits, resolves a
dependent field, or handles a select/table round-trip.

For live client-side cross-field state, use the declarative condition API:
`visibleWhen()`, `requiredWhen()`, `disabledWhen()`, and `readOnlyWhen()`. Those conditions serialize
to the client and are re-checked on the server.

## Custom closure hooks

When adding a new Lattice extension point, accept `Closure|T` and resolve it at the moment the value is
needed:

```php
use Lattice\Lattice\Facades\Evaluate;

$resolved = Evaluate::resolve(
    $value,
    Evaluate::context()
        ->named('value', $currentValue)
        ->typed(Request::class, $request),
);
```

For form fields, start from the field's evaluation context so `$state`, `$get`, `$value`,
`$component`, typed `FormData`, typed `Request`, and typed component injection all stay consistent.
