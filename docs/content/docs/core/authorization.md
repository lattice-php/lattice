---
title: Authorization
description: Gate a definition, page, or component with can and authorize().
---

Lattice gates everything with the same two tools. **`can`** declares subject-less abilities — the
same word as Laravel's `can:` middleware and `$user->can()`. **`authorize()`** holds the logic that
needs the request or the record it acts on.

|                                                                 | declare an ability     | custom logic                 |
| --------------------------------------------------------------- | ---------------------- | ---------------------------- |
| Definition — form, table, action, bulk action, fragment, layout | `#[AsTable(can: 'x')]` | `authorize()`                |
| Page                                                            | `#[AsPage(can: 'x')]`  | `authorize()`                |
| Component, column, filter, row action                           | `->can('x')`           | `->visible()` / `->hidden()` |

## Declaring `can`

Put the ability on the attribute — no method needed:

```php
#[AsTable('admin.users', can: 'admin.users.manage')]
class AdminUsersTable extends EloquentTableDefinition { /* … */ }
```

Pass an array when several must hold — every one has to pass:

```php
#[AsTable('admin.users', can: ['admin.access', 'admin.users.manage'])]
```

Pages take the same argument:

```php
#[AsPage(route: '/admin/users', can: 'admin.access')]
class AdminUsersPage extends Page { /* … */ }
```

And any component, column, filter, or row action takes it as a method:

```php
TextColumn::make('cost')->can('finance.costs');
Heading::make('Internal notes')->can(['support.access', 'support.notes']);
```

A `can` declaration is checked against `Gate::forUser($request->user())` and is **never widened** by
the custom logic beside it — an `authorize()` override can only narrow it further, and `->visible(true)`
cannot bring back a component whose `can` failed. That holds wherever the thing is reached from, which
includes a bulk action, gated by its own declaration _and_ its table's.

:::caution
A page's `can` (or `middleware`) does **not** protect the definitions rendered on it. Every definition
is reached through its own endpoint (`lattice/tables/{table}`, `lattice/actions/{action}`, …), which
runs the middleware in `config('lattice.<group>.middleware')` — `['web', 'auth']` by default — and
then the definition's own gate. Putting `can: 'admin.users.manage'` on a page gates who can _load_ the
page; it does not gate the table on it. Declare the ability on the definition too.
:::

## Writing `authorize()`

Abilities that need a subject — `can('view', $project)` — go in `authorize()`, where the sealed
context is available to resolve the record. It returns `true` by default, so a definition or page is
open until you say otherwise.

```php
use Illuminate\Http\Request;

public function authorize(Request $request): bool
{
    return $request->user()?->can('update', $this->product()) ?? false;
}
```

`authorize()` is the only method you override. The framework never calls it directly — it composes
it with whatever `can` declared, so the two can't drift apart.

The gate runs on the definition's own endpoint before any work happens:

- An **action** or **bulk action** that fails never reaches `handle()`.
- A **form** is validated and handled only when authorized.
- A **table** or **fragment** that fails resolves to nothing rather than leaking data.

Because the same definition class owns both the rendered component and the endpoint that backs it,
the authorization lives in one place and can't be bypassed by calling the endpoint directly.

## Hidden at render time, not just at the endpoint

A component that fails its gate doesn't just 403 if you call its endpoint — it's hidden from the page
in the first place. Registries resolve a failed check to an unsealed, hidden component, and every
place that embeds definition-backed components (page schemas, table row actions, notification actions,
a form nested under an action) filters them out before serializing. The client never sees a trace of
it: no id, no endpoint, no signed reference. A plain component's `->can()` drops it the same way.

:::note
The endpoint's own gate still runs on every request — hiding at render time is defense in depth, not
a replacement for it. A forged or stale reference is still rejected. A plain component has no endpoint
of its own, so `->can()` is a render gate only; anything that loads data must be a definition.
:::

## Reading trusted context

A definition often needs the record it acts on. Pass it as [context](/actions/overview/#placing-an-action)
when placing the component, and read it back with a typed accessor:

```php
Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]);
```

```php
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Core\Concerns\ResolvesContextModels;

class ArchiveProductAction extends ActionDefinition
{
    use ResolvesContextModels;

    protected function product(): Product
    {
        return $this->contextModel('product_id', Product::class);
    }
}
```

`contextModel()` resolves the context value through the model's own `resolveRouteBinding()` — the
same column a route parameter would bind against — and aborts with a 404 when the key is missing or
no record matches. It lives on the opt-in `ResolvesContextModels` trait rather than on `Definition`
itself, because the package does not depend on `illuminate/database`. `Definition::context()` and its
typed scalar siblings — `contextString()`/`contextStringOrNull()`, `contextInt()`/`contextIntOrNull()`
— are available on every definition without the trait; the strict variants abort with a 404 on a
missing or wrongly-typed value instead of coercing it.

The context is sealed into the component's signed reference, so the value `authorize()` and `handle()`
read is the value the server issued — not something a client can change. See
[Security](/advanced/security/) for how that sealing works.

:::caution
Inside `authorize()` on a component that renders as part of a page, use the `OrNull` accessors
(`contextModelOrNull()`, `contextStringOrNull()`, `contextIntOrNull()`) instead of their strict
counterparts. At the endpoint, a `false` from `authorize()` is a 403 — but at render time an
unauthorized component is simply hidden, and a strict accessor's `abort(404)` would take the whole
page down with it instead.
:::
