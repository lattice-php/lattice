---
title: Toasts
description: Transient notifications raised from the server — from an action's result or flashed into the next response.
---

A toast is a short notification the client shows and dismisses. Toasts are raised on the server and
carry a `Variant` — the shared vocabulary (`Primary`, `Secondary`, `Success`, `Info`, `Warning`,
`Danger`) buttons use — that styles them.

## From an action

The most common source is an [action](/actions/overview/). Add a toast to the `ActionResult` it
returns; the variant is optional and defaults to success:

```php
return ActionResult::success()
    ->toast('Product archived.')                       // defaults to Success
    ->toast('Could not reach the warehouse.', Variant::Danger);
```

See [Effects & results](/actions/effects/#toasts) for the full effect list.

## Flashing from outside an action

To show a toast after a controller redirect, from a listener, middleware, or anywhere an `ActionResult`
is not available, use `Effects::flash()`:

```php
use Lattice\Lattice\Ui\Enums\Variant;
use Lattice\Lattice\Facades\Effects;

public function handle(Request $request): Response
{
    $this->validate($request);
    // … persist …

    Effects::flash(Effects::toast('Profile saved.', Variant::Success));

    return redirect('/profile');
}
```

The flashed toast is stored in the `latticeEffects` session bag, delivered with the next Inertia
response, and shown once. `Effects::flash()` accepts any number of effects — toast, callout,
and more — see [Effects & results](/actions/effects/#flashing-effects-without-an-action) for details.

## Building a message directly

Both paths accept a `Toast` effect. Build one explicitly to set a lifetime, control
dismissal, or attach an action, then pass it to `->toast()` (or `Effects::toast()`):

```php
use Lattice\Lattice\Effects\Builtin\Toast;

return ActionResult::success()->toast(
    Toast::make('Product archived.', Variant::Success)
        ->duration(8000)                       // auto-dismiss after 8s (default 4000ms)
        ->link('View products', '/products'),  // a link rendered in the toast
);
```

The builder options:

| Method                           | Effect                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `->duration($ms)`                | Auto-dismiss after `$ms` milliseconds (default 4000).                                                                                                      |
| `->persistent()`                 | Never auto-dismiss; the toast stays until it is closed.                                                                                                    |
| `->dismissible(false)`           | Hide the close button.                                                                                                                                     |
| `->link($label, $href, $method)` | Render a link in the toast (`$method` defaults to `HttpMethod::Get`).                                                                                      |
| `->action($component)`           | Render an action instead of a link — e.g. an [`Action`](/actions/overview/) that opens a confirm dialog or [modal form](/actions/confirmation-and-forms/). |

## Rendering

Toasts render through the `<Toaster>` the Lattice `Provider` mounts by default, anchored bottom
center and dismissing each after its duration. Pass `toaster={false}` to the `Provider` to opt out
and mount your own.
