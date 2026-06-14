---
title: Security
description: How Lattice signs component references so a server-driven endpoint can trust what the client sends back.
---

Lattice drives the UI from the server but the endpoints behind forms, tables, and actions are called
by the client. To keep that safe, every interactive component carries a **signed reference** — a
sealed token that the matching endpoint verifies before doing any work.

## The signed reference

When an interactive component (a `Form`, `Table`, `Action`, `Fragment`, …) serializes, Lattice seals a
reference into its props and ships it as the `X-Lattice-Ref` header on the component's requests. The
reference is an **encrypted** payload containing:

- the component **type** and **key** (which definition this is for),
- the **context** you attached with `->context()`,
- the current **user id** and a hash of the **session**,
- an **expiry** timestamp.

On the way back, the endpoint decrypts the reference and rejects the request (`403`) if the type or
key doesn't match, the token has expired, or the user or session no longer matches the one it was
issued to. Only then does it run.

## Why context is trustworthy

Because the context travels inside the encrypted reference — not as ordinary request input — a client
can't change it. The endpoint merges the **trusted** context back onto the request, so
`$this->context($request, 'product_id')` always returns the value the server sealed. This is what lets
[row actions](/tables/actions/) safely carry a record id and [authorization](/core/authorization/)
trust it.

## Expiry

References expire after a configurable lifetime (30 minutes by default). Tune it with the
`lattice.security.ref_lifetime` config value (in minutes):

```php
// config/lattice.php
'security' => [
    'ref_lifetime' => 30,
],
```

A longer lifetime keeps long-lived pages working without a refresh; a shorter one narrows the window
in which a captured reference could be replayed.
