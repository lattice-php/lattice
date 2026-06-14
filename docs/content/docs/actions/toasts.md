---
title: Toasts
description: Transient notifications raised from the server — from an action's result or flashed from a form.
---

A toast is a short notification the client shows and dismisses. Toasts are raised on the server and
carry a `ToastVariant` — `Success`, `Info`, `Warning`, or `Error` — that styles them.

## From an action

The most common source is an [action](/actions/overview/). Add a toast to the `ActionResult` it
returns; the variant can come first or second:

```php
return ActionResult::success()
    ->toast('Product archived.')                       // defaults to Success
    ->toast(ToastVariant::Error, 'Could not reach the warehouse.');
```

See [Effects & results](/actions/effects/#toasts) for the full effect list.

## From a form or definition

A definition can flash a toast that appears on the next page — handy after a form submit that
redirects. `$this->toast()` flashes the message; return your redirect as usual:

```php
use Lattice\Lattice\Core\Enums\ToastVariant;

public function handle(Request $request): Response
{
    $this->validate($request);
    // … persist …

    $this->toast(ToastVariant::Success, 'Profile saved.');

    return redirect('/profile');
}
```

The flashed toast is delivered with the next Inertia response and shown once.

## Building a message directly

Both paths wrap a `ToastMessage` value object. Build one explicitly to set a lifetime, control
dismissal, or attach an action, then pass it to `->toast()` (or `Effect::toast()`):

```php
use Lattice\Lattice\Core\Values\ToastMessage;

return ActionResult::success()->toast(
    ToastMessage::make(ToastVariant::Success, 'Product archived.')
        ->duration(8000)                       // auto-dismiss after 8s (default 4000ms)
        ->link('View products', '/products'),  // a link rendered in the toast
);
```

The builder options:

| Method                            | Effect                                                                 |
| --------------------------------- | ---------------------------------------------------------------------- |
| `->duration($ms)`                 | Auto-dismiss after `$ms` milliseconds (default 4000).                  |
| `->persistent()`                  | Never auto-dismiss; the toast stays until it is closed.                |
| `->dismissible(false)`            | Hide the close button.                                                 |
| `->link($label, $href, $method)`  | Render a link in the toast (`$method` defaults to `HttpMethod::Get`).  |
| `->action($component)`            | Render an action instead of a link — e.g. an [`Action`](/actions/overview/) that opens a confirm dialog or [modal form](/actions/confirmation-and-forms/). |

## Rendering

Toasts render through the `<Toaster>` the Lattice `Provider` mounts by default, anchored bottom
center and dismissing each after its duration. Pass `toaster={false}` to the `Provider` to opt out
and mount your own.
