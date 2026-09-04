---
title: Authorization
description: Gate a definition, page, or component with can and authorize().
---

Lattice gates everything with the same two tools. **`can`** declares an ability — the same word as
Laravel's `can:` middleware and `$user->can()` — either subject-less or, with `on`, checked against a
specific record. **`authorize()`** holds the logic that needs the request or something `can`/`on` can't
express.

|                                                                 | declare an ability              | custom logic                 |
| --------------------------------------------------------------- | ------------------------------- | ---------------------------- |
| Definition — form, table, action, bulk action, fragment, layout | `#[AsTable(can: 'x', on: 'y')]` | `authorize()`                |
| Page                                                            | `#[AsPage(can: 'x', on: 'y')]`  | `authorize()`                |
| Component, column, filter, row action                           | `->can('x', on: 'y')`           | `->visible()` / `->hidden()` |

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

## Declaring a gate subject with `on`

Add `on` when the ability needs a specific record rather than a subject-less check —
`Gate::check('update', $product)` rather than `Gate::check('manage-widgets')`. `on` names a
[context](/core/context/) key; its resolved value becomes the `Gate::check()` subject, so a gate closure
written for `can('update', $product)` works unchanged.

On a definition or a plain component, `on` names a context key exactly as `contextModel()` would read
it:

```php
#[AsAction('app.products.archive', can: 'update', on: 'product')]
class ArchiveProductAction extends ActionDefinition { /* … */ }
```

```php
Heading::make('Internal notes')->can('update', on: 'product');
```

On a page, `on` names a route parameter instead — a bound model as-is, or an unbound scalar resolved
through a [registered](/core/context/#registering-a-resolver) `Lattice::context()` resolver of the same
name:

```php
#[AsPage(route: '/products/{product}/edit', can: 'update', on: 'product')]
class ProductEditPage extends Page { /* … */ }
```

A missing subject — the key absent, or its resolver finding nothing — **denies outright**. It never
falls back to a subject-less check.

:::caution
A page's `on` middleware differs from a subject-less `can`. Laravel's own `can:{ability}` middleware
would hand an unbound route parameter to the gate as a raw scalar, blind to a registered resolver — so
when `on` is set, Lattice registers its own `AuthorizeGateSubject` middleware in its place. It resolves
the subject exactly as `toResponse()` and `callAction()` do — through the same
`GateSubjects::fromRoute()` — so the middleware and the page body can never disagree about who they
checked.
:::

`can` and `on` are inherited from a [base page](/core/pages/#shared-base-pages) the same way layout,
width, and middleware are: a concrete page declaring its own `can` replaces — rather than merges with —
an inherited ability, and the same holds for `on`.

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
when placing the component, and read it back with a typed accessor — `contextModel()`, backed by a
resolver [registered](/core/context/#registering-a-resolver) once via `Lattice::context()`, or the
explicit form on the opt-in `Lattice\Core\Concerns\ResolvesContextModels` trait. `Definition::context()`
and its typed scalar siblings — `contextString()`/`contextStringOrNull()`,
`contextInt()`/`contextIntOrNull()` — are available on every definition without the trait. See
[Context](/core/context/) for registering resolvers, memoization, and how context inherits into a
definition's children, a page's frame, slots, and closure-built modals.

The context is sealed into the component's signed reference, so the value `authorize()` and `handle()`
read is the value the server issued — not something a client can change. See
[Security](/advanced/security/) for how that sealing works.

:::caution
Inside `authorize()` on a component that renders as part of a page, use the `OrNull` accessors
(`contextModelOrNull()`, `contextStringOrNull()`, `contextIntOrNull()`) or `hasContext()` instead of
their strict counterparts. At the endpoint, a `false` from `authorize()` is a 403 — but at render time an
unauthorized component is simply hidden, and a strict accessor's `abort(404)` would take the whole
page down with it instead.
:::
