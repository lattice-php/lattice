---
title: What is Lattice?
description: Describe your interface once, as a schema the server owns — Lattice renders it with real React components over Inertia.
---

Lattice is a server-driven UI layer for Laravel applications running [Inertia](https://inertiajs.com/) with React. You describe your interface — pages, components, forms, tables, actions, and menus — in PHP, and Lattice serializes that description to a typed component tree that real React components render in the browser.

## The problem it solves

Every web application maintains its user interface twice. The backend already knows what a screen is made of: which fields an entity has, which rules validate them, who is allowed to see which actions, how a collection is sorted, filtered, and paged. The frontend then restates all of that in a second codebase — the same fields as inputs, the same rules as error handling, the same permissions as conditionally hidden buttons, the same columns and filters as table state. Two codebases, one contract, and nothing enforcing that they agree. Every feature is built twice, and the two copies drift apart as the app grows.

The way out is to notice that most application UI is not free-form. Forms, tables, actions, navigation, notifications — the day-to-day surface of a business application — are structured and repetitive enough to be _described_ rather than hand-built. When a consistent schema can describe the interface, the duplication disappears: the side that owns the data and the rules declares the screen once, the schema _is_ the contract, and the other side's only job is to render it. There is no hand-written API between them and no parallel implementation to keep in sync, because the renderer always receives exactly what the server produced.

Lattice is that idea applied to Laravel. The server is the single source of truth for what a screen _is_; a typed schema carries it over the wire; real React components render it.

## How it works

You write a page as a PHP class and route a URI to it. The page builds a tree of component definitions; Lattice serializes that tree to a typed payload and ships it over Inertia as a normal page visit. On the client, a single React component renders the tree by resolving each node against a component registry. Interactive pieces — submitting a form, paging a table, clicking an action — call back into Lattice endpoints that run your PHP and return the next payload.

Because the wire format is generated into TypeScript types, the React side is typed against the same contract the server serializes — the two can't drift without a compile error.

## What you get

- **Pages** composed from server-side component trees.
- **Forms** with server-side validation and conditional fields.
- **Tables** backed by Eloquent, with sorting, filtering, and pagination.
- **Actions** that run on the server and dispatch effects — toasts, redirects, refreshes — back to the client.
- **Navigation** defined alongside the pages it points at.

## Is it for you?

Lattice fits teams building Laravel + Inertia + React who want one place to define what their screens are — and one contract instead of two implementations. You still write React when you want custom components — Lattice renders them through the same registry — but the day-to-day screens come from the server.

Read the [Core Concepts](/introduction/core-concepts/) next for the mental model, then [Installation](/introduction/installation/) to add it to your app.
