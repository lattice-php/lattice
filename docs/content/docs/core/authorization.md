---
title: Authorization
description: Gate any definition — form, table, action, fragment, or layout — with an authorize() check.
---

Every Lattice definition carries an `authorize()` check. Override it to decide whether the current
request may use it; it returns `true` by default, so a definition is open until you say otherwise.

```php
use Illuminate\Http\Request;

public function authorize(Request $request): bool
{
    return $request->user()?->can('update', $this->product()) ?? false;
}
```

The check runs on the definition's own endpoint before any work happens:

- An **action** or **bulk action** that fails `authorize()` never reaches `handle()`.
- A **form** is validated and handled only when authorized.
- A **table** or **fragment** that fails resolves to nothing rather than leaking data.

Because the same definition class owns both the rendered component and the endpoint that backs it,
the authorization lives in one place and can't be bypassed by calling the endpoint directly.

## Hidden at render time, not just at the endpoint

An unauthorized definition-backed component doesn't just 403 if you call its endpoint — it's hidden
from the page in the first place. Registries resolve a failed `authorize()` check to an unsealed,
hidden component, and every place that embeds definition-backed components (page schemas, table row
actions, notification actions, a form nested under an action) filters them out before serializing.
The client never sees a trace of it: no id, no endpoint, no signed reference.

:::note
The endpoint's own `authorize()` check still runs on every request — hiding at render time is
defense in depth, not a replacement for it. A forged or stale reference is still rejected.
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
