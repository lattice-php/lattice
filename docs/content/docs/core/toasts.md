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

Both paths wrap a `ToastMessage` value object. Build one explicitly when you need to pass it around:

```php
use Lattice\Lattice\Core\Values\ToastMessage;

ToastMessage::make(ToastVariant::Warning, 'Your trial ends tomorrow.');
```
