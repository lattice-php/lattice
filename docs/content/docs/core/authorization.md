---
title: Authorization
description: Gate any definition — form, table, action, fragment, or layout — with an authorize() check.
---

Every Lattice definition is `Authorizable`. Override `authorize()` to decide whether the current
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
when placing the component, and read it back with `context()`:

```php
Action::use(ArchiveProductAction::class)->context(['product_id' => $row['id']]);

// inside the action:
protected function product(): Product
{
    return Product::query()->findOrFail($this->context('product_id'));
}
```

The context is sealed into the component's signed reference, so the value `authorize()` and `handle()`
read is the value the server issued — not something a client can change. See
[Security](/advanced/security/) for how that sealing works.
