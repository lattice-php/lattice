---
title: Effects & results
description: What an action returns — a success or failure result carrying effects the client dispatches.
---

`handle()` returns an `ActionResult`: a success/failure flag, optional data, and a list of **effects**
the client runs in order once the action responds.

## Results

Build a result from one of two constructors, optionally passing data:

```php
ActionResult::success(['id' => $product->id]);
ActionResult::failure(['reason' => 'locked']);
```

Then chain effects — each returns a new result, so they read as a pipeline:

```php
return ActionResult::success()
    ->toast('Archived.')
    ->reloadComponent('app.products');
```

## Effects

| Effect                          | What it does                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| `->toast($message, $variant)`   | Shows a toast. Variant defaults to success.                         |
| `->reloadComponent($id)`        | Re-fetches a single component (e.g. the table the action changed).  |
| `->reloadPage()`                | Reloads the current page's props.                                   |
| `->redirect($url)`              | Navigates to a URL.                                                 |
| `->download($url)`              | Triggers a file download.                                           |
| `->openModal($id)` / `->closeModal($id)` | Opens or closes a modal by id (`closeModal()` closes the current modal). |
| `->resetForm($id)`              | Resets a form to its initial values (`resetForm()` resets the current form). |

```php
return ActionResult::success()
    ->toast('Report ready.', ToastVariant::Success)
    ->download(route('reports.download', $report));
```

### Toasts

`->toast()` accepts a message and an optional `ToastVariant` (`Success`, `Error`, `Warning`, `Info`).
The variant can come first or second — both `->toast('Saved.')` and
`->toast(ToastVariant::Error, 'Could not save.')` read naturally. Pass a `ToastMessage` instead to
set a lifetime, control dismissal, or attach a link or action — see [Toasts](/core/toasts/).

### Refreshing what changed

After an action mutates data, refresh just the affected component rather than the whole page.
`->reloadComponent()` takes the component id — a table's `#[Table]` id, for example — so only that
component re-fetches:

```php
return ActionResult::success()->reloadComponent('app.products');
```

## How effects reach the client

The result serializes to `{ ok, data, effects }`. Each effect carries its `EffectType` (`toast`,
`reloadComponent`, `reloadPage`, `redirect`, `download`, `openModal`, `closeModal`, `resetForm`) and
its payload; the client dispatches them in order. The effect types are a shared enum, so the PHP
helpers and the client dispatcher stay in lockstep.
