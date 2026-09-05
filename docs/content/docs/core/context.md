---
title: Context
description: Typed, memoized data threaded from where a component is placed to where it runs — registered once, inherited everywhere.
---

Context is the data a component carries from where it's placed to where it runs: a row's record for an
action, a form's parent model, the value behind a page's URL segment. It's always **scalar on the wire**
— sealed into a component's signed reference, never a serialized object — and **sealed per component**,
so the value a definition reads back is the value the server issued, not something a client controlled.

`Lattice::context()` registers, per key, how that scalar resolves into a typed model. Once registered, a
key is resolved at most once per request, and cascades automatically into every child component Lattice
builds from a definition or a page that has it.

## Registering a resolver

Register a key from a service provider's `boot()`. The Eloquent sugar resolves through the model's own
route binding, exactly like a route parameter would:

```php
use Lattice\Core\Facades\Lattice;

Lattice::context('tenant', Tenant::class, by: 'slug');
```

Or register a closure for anything that isn't a plain route-bound Eloquent lookup. It resolves through
the same [closure evaluation](/core/closure-evaluation/) as every other Lattice callback: `$value` (the
raw context scalar), `$key` (the context key, as a string), `$context` (the definition's full raw
context array, so one resolver can read another key), a typed `Request`, and any container type.

```php
Lattice::context('workspace', function (string $value, Request $request): Workspace {
    return Workspace::where('slug', $value)->firstOrFail();
});
```

Registering the same key twice replaces the previous resolver — the last `Lattice::context()` call for a
key wins.

Give a closure-registered key a `keyBy` closure too, for turning the resolved object back into its wire
scalar — needed when a model is [passed directly as a context value](#passing-models-as-context-values).
It resolves the model as `$value`, or by its own type:

```php
Lattice::context(
    'workspace',
    fn (string $value): Workspace => Workspace::where('slug', $value)->firstOrFail(),
    keyBy: fn (Workspace $workspace): string => $workspace->slug,
);
```

Without a `keyBy`, Lattice falls back to the resolved object's own `getRouteKey()`, throwing only if
neither exists and something actually needs to serialize the value. The Eloquent sugar always builds
both closures for you, from `by` (or the model's own route key name).

## Reading it

Every `Definition` (form, table, action, bulk action, fragment, layout) reads context back with:

- **`context('key')`** — the raw scalar, untyped, as before.
- **`hasContext('key')`** — presence, distinct from "not found": a key that's set but whose resolver
  finds nothing still passes this check.
- **`contextModel('key')`** — the value resolved through its registered resolver, memoized for the
  request. Aborts with a 404 when the key is absent or the resolver finds nothing. Throws a
  `LogicException` when no resolver is registered for the key at all.
- **`contextModelOrNull('key')`** — the same resolution, returning `null` instead of aborting.

```php
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;

class ArchiveWorkspaceAction extends ActionDefinition
{
    public function handle(): ActionResult
    {
        $workspace = $this->contextModel('workspace');
        $workspace->update(['status' => 'archived']);

        return ActionResult::success();
    }
}
```

:::caution
Inside a render-time `authorize()`, reach for `contextModelOrNull()` or `hasContext()` instead of
`contextModel()`. At the endpoint, a missing subject is a 404 — but at render time an unauthorized or
incomplete component is simply hidden, and a strict accessor's `abort(404)` would take the whole page
down with it. See [Authorization](/core/authorization/) for the same rule applied to `can`.
:::

`Lattice\Core\Concerns\ResolvesContextModels` keeps its explicit two-argument form —
`contextModel('workspace', Workspace::class, by: 'slug')` — which resolves through the model's own route
binding directly, with nothing registered. Its one-argument form, `contextModel('workspace')`, delegates
to the registry above and asserts the result is an Eloquent model, throwing a `LogicException`
otherwise.

## Memoization

A resolver runs **at most once per request** for a given key and scalar value, however many times it's
read and by however many definitions. Two `contextModel()` calls in the same `handle()`, or an
`authorize()` and the `handle()` that follows it, see the result of one evaluation. A miss ("not
found") is cached too.

That makes a resolver closure the right place for a once-per-request side effect keyed to the resolved
value — switching the session's active record to match it, say:

```php
Lattice::context('workspace', function (string $value, Request $request): Workspace {
    $workspace = Workspace::where('slug', $value)->firstOrFail();
    $request->user()?->switchWorkspace($workspace);

    return $workspace;
});
```

## Inheritance

A key with a resolver registered via `Lattice::context()` cascades into every child component a
definition builds — nested actions, a modal's form, a row's actions — with no configuration.
`config('lattice.context.inherited_keys')` still exists for a key that has **no** resolver but should
cascade anyway. Explicit context passed at a component's own placement always wins over an inherited
value under the same key.

`table` is reserved and never cascades, registered or whitelisted — Lattice uses it internally to route
a bulk action back to its owning table, and it must never leak into an unrelated child.

## Passing models as context values

A context value doesn't have to be the scalar itself — pass the resolved model directly, and Lattice
normalizes it before the definition gates, seals, or inherits its context:

```php
Table::use(WorkspaceMembersTable::class, ['workspace' => $workspace]);
```

An object under a key with a registered resolver is turned into its wire-safe scalar through that key's
`keyBy` closure (or `getRouteKey()`) — the sealed reference never carries a serialized model, only the
same scalar a route parameter would. A `BackedEnum` value normalizes to its `->value` regardless of
whether the key has a resolver registered — it was always wire-safe on its own. Any other object passed
under a key with **no** registered resolver throws, rather than being silently JSON-encoded wholesale
into the sealed ref.

## Frames

Lattice opens a "frame" — the currently inheritable context — everywhere it builds child components, so
a key registered once cascades through every seam Lattice threads data across:

- **Definitions** — a definition's own gated children (row actions, a modal's schema, nested actions)
  build inside a frame opened from its context, and its endpoint activates the same frame from the
  sealed reference it verifies.
- **Pages, by convention** — before `render()` runs, a page opens a frame from the route's bound
  parameters. An object parameter seeds the key whose resolver was registered for its class, whatever
  the parameter itself is named — `render(Tenant $current_tenant)` seeds `tenant` because
  `Lattice::context('tenant', Tenant::class)` registered that model, not because of the parameter's
  name. A closure resolver takes part through its declared return type — `fn (string $value): Tenant`
  records `Tenant` the same way — or through an explicit `model: Tenant::class` when it declares none. A
  scalar parameter seeds the key sharing its own name, when that name is itself registered.
  `PageSchema::context([...])` extends or overrides the frame explicitly for anything the convention
  misses:

  ```php
  public function render(PageSchema $schema, Workspace $workspace): PageSchema
  {
      return $schema
          ->context(['workspace' => $workspace])
          ->schema([
              Table::use(WorkspaceMembersTable::class),
          ]);
  }
  ```

  Chain `context()` **before** `schema()`. PHP builds `schema()`'s array argument — and every component
  in it — only after `context()` has already returned, so those components see the extended frame only
  when `context()` runs first in the chain.

- **Slots** — each `Lattice::extend()` factory runs inside the inherited frame merged with the slot's
  own `->context([...])`, filtered to the registered/whitelisted keys before it cascades further. An
  object under an unrelated, unregistered key in a slot's context is dropped silently rather than
  throwing — the factory itself still receives it directly, by injection, exactly as before.
- **Closure-built modals** — `->modal(fn (): Modal => ...)` snapshots the inherited frame at the moment
  it's built, not when the closure eventually runs — which happens later, during serialization, after
  that frame has already closed. The modal's own schema — a form, say — inherits the frame its trigger
  was built in.
- **Layouts** — a layout renders inside the page's still-open frame, so a layout's `schema()` sees the
  same context the page's own `render()` does.

:::note
Read context, not route parameters. `definition()` (and `authorize()`, `handle()`, …) runs on a page's
own render — inside its frame — and again on the definition's own signed endpoint, which carries no
route parameters of its own. `contextModel()` and `context()` work identically on both paths;
`$request->route()` only works on the first.
:::
