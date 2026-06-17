---
title: Realtime
description: Declare websocket listeners on a page that run client effects when a broadcast event arrives.
---

A page can subscribe to broadcast events and react to them on the client — show a toast, raise a
[callout](/actions/effects/#callouts), or reload the page — without writing any JavaScript. You
declare the listeners on the server; Lattice wires up the websocket subscription and runs the effects
when an event arrives.

It is built on [Laravel Echo](https://laravel.com/docs/broadcasting) and a broadcasting backend such
as [Reverb](https://laravel.com/docs/reverb).

## Declaring listeners

Override `listeners()` on a [page](/core/pages/) and return one or more `Listen` declarations. Each
names a channel, the broadcast event(s) to react to, and the effects to dispatch:

```php
use Lattice\Lattice\Realtime\Listen;

protected function listeners(): array
{
    return [
        Listen::channel('orders')
            ->on('.OrderShipped')
            ->toast('An order just shipped'),
    ];
}
```

When an `OrderShipped` event broadcasts on the `orders` channel, every connected client viewing the
page shows the toast. The leading dot (`.OrderShipped`) matches a broadcast name as-is; drop it to use
Laravel's namespaced event class convention.

## Channels

Choose the channel type with the matching constructor:

```php
Listen::channel('orders');        // public
Listen::private('orders.42');     // private — requires channel authorization
Listen::presence('room.42');      // presence
```

Private and presence channels go through Laravel's [channel authorization](https://laravel.com/docs/broadcasting#authorizing-channels),
so only authorized users subscribe.

## Effects

Listener effects are the broadcast-safe subset of [action effects](/actions/effects/) — they run with
no request context, so they can't redirect or open a modal:

| Effect | What it does |
| --- | --- |
| `->toast($message, $variant?)` | Shows a [toast](/actions/toasts/). |
| `->callout($callout)` | Raises a persistent [callout](/actions/effects/#callouts) (needs a `Callouts` slot in the layout). |
| `->reloadPage()` | Reloads the current page's props — the simplest way to pull fresh data. |

Chain several on one listener, and declare several listeners per page:

```php
Listen::private('orders.'.$request->user()->id)
    ->on(['.OrderShipped', '.OrderDelivered'])
    ->toast('Your order was updated')
    ->reloadPage();
```

## Client setup

Lattice mounts the listeners from the page payload for you — there is nothing to render. You only need
Echo configured once in your app entry point:

```ts
import { configureEcho } from "@laravel/echo-react";

configureEcho({ broadcaster: "reverb" /* …your Reverb/Pusher config */ });
```

If a page declares listeners but Echo isn't configured, Lattice logs a warning and renders nothing —
the page still works, it just won't receive realtime updates.

:::caution
Realtime can be turned off globally with the `lattice.realtime.enabled`
[config flag](/introduction/configuration/#realtime). When disabled, listeners are not serialized to
the client.
:::
