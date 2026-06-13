---
title: Pages
description: The entry point of a Lattice screen — a PHP class that builds a component tree and renders through Inertia.
---

A page extends `Lattice\Lattice\Http\Page`, returns a `title()`, and builds its UI in `render(PageSchema $schema)`. You annotate the class with `#[Page(route: '…')]`; Lattice discovers it and registers the route automatically (or you can register pages explicitly with `Lattice::pages([...])`), rendering through Inertia with no controller or Inertia page component of your own. Layout, container, and middleware are declared in the `#[Page]` attribute and can be inherited from a shared base page. Pages also carry their breadcrumbs and menus.

See [Getting Started](/introduction/getting-started/) for a working example.

:::note
Full Pages reference is being written. For now, the [Core Concepts](/introduction/core-concepts/) overview and [Getting Started](/introduction/getting-started/) cover the essentials.
:::
