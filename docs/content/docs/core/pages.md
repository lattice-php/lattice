---
title: Pages
description: The entry point of a Lattice screen — a PHP class that builds a component tree and renders through Inertia.
---

A page extends `Lattice\Lattice\Http\Page`, returns a `title()`, and builds its UI in `render(PageSchema $schema)`. You route a URI to it with the `Route::latticePage()` macro; Lattice renders it through Inertia with no controller or Inertia page component of your own. Pages also carry their layout, container, breadcrumbs, and menus.

See [Getting Started](/introduction/getting-started/) for a working example.

:::note
Full Pages reference is being written. For now, the [Core Concepts](/introduction/core-concepts/) overview and [Getting Started](/introduction/getting-started/) cover the essentials.
:::
