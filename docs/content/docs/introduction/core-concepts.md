---
title: Core Concepts
description: How Lattice turns PHP definitions into React UIs over Inertia, and the building blocks you compose them from.
---

Lattice is **server-driven**: you describe your interface — pages, components, forms, tables, actions, and menus — in PHP, and Lattice serializes that description to a typed component tree that real React components render over Inertia. You keep building the way you already do in Laravel, and there is no client-side routing, no hand-written API, and no UI contract duplicated across two languages.

This page is a short tour of the model and the building blocks. Each block links to its own section for the detail.

## How a page renders

A page is a PHP class. It builds a tree of components, Lattice serializes that tree to a typed payload, and a single React component renders it through Inertia:

```
PHP Page  →  PageSchema (tree of Components)  →  typed JSON  →  Inertia  →  lattice/page  →  registry  →  React
```

1. Your `Page::render()` populates a `PageSchema` with component builders.
2. Each `Component` serializes to a node with a `type` and `props`.
3. Inertia ships that payload to the browser as a normal page visit.
4. The `lattice/page` React component looks up each node's `type` in the renderer **registry** and renders the matching React component, recursing through children.

The same flow powers interactive pieces: a form submit, a table page change, or an action click calls a Lattice endpoint, which runs your PHP and returns the next payload.

## The building blocks

### Pages

A page extends `Lattice\Lattice\Http\Page`, returns a `title()`, and builds its UI in `render()`. You point a URI at it with the `Route::latticePage()` macro — no Inertia page component or controller to write by hand. A page also carries its layout, container, breadcrumbs, and menus.

[Learn more →](/core/pages/)

### Components

Components are the visual vocabulary. Server-side builders — `Card`, `Grid`, `Stack`, `Heading`, `Text`, `Tabs`, `Badge`, `Link`, and more — compose into the tree a page renders. Each one serializes to a typed node that maps to a React component in the registry, and you can register your own.

[Learn more →](/core/components/)

### Forms

Forms are field definitions in PHP — `TextInput`, `Select`, `Checkbox`, `DateInput`, `RichEditor`, and others. Validation runs on the server (live, via Precognition), and fields can react to other fields through conditions. A form posts back to its own endpoint, which validates and handles the submission.

[Learn more →](/forms/overview/)

### Tables

Tables are Eloquent-backed listings. You declare columns, and Lattice handles sorting, filtering, and pagination against the database, fetching rows from the table's endpoint. Rows and selections can carry actions.

[Learn more →](/tables/overview/)

### Actions

Actions run on the server in response to a click — a single row action or a bulk action over a selection. They return **effects** the client dispatches: a toast, a redirect, a component or page refresh, or opening a modal.

[Learn more →](/actions/overview/)

### Navigation

Menus and the sidebar are defined in PHP — most simply by adding `->sidebar()` to a `latticePage` route — and surfaced to the React shell, so navigation stays in sync with the pages it points at.

[Learn more →](/core/navigation/)

:::note
Fragments are a related building block — server-defined async or partial UI fetched on demand from their own endpoint. They follow the same definition-and-endpoint model as the blocks above.
:::

## Discovery and endpoints

You rarely wire definitions up by hand. Lattice **discovers** them: annotate a class with an attribute like `#[Form]`, `#[Table]`, `#[Action]`, `#[BulkAction]`, or `#[Fragment]`, and Lattice finds it under the path configured in `discover` (your `app/` directory by default). Each kind gets its own registry and a stable endpoint (`lattice/forms/{form}`, `lattice/tables/{table}`, and so on) that the rendered components call back into.

## One model, no drift

Because the server describes the UI and the client only renders it, the two can never disagree about the shape of a page. Lattice generates TypeScript types from the PHP enums and value objects that make up the wire format, so the React side is typed against the same contract the server serializes — drift is a compile error, not a runtime surprise.

## Where to go next

- [Installation](/introduction/installation/) — add Lattice to your app.
- [Getting Started](/introduction/getting-started/) — build and route your first page.
- The building-block sections above, as you reach for each piece.
