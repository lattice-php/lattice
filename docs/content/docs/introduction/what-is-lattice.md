---
title: What is Lattice?
description: A server-driven UI layer for Laravel and Inertia — describe pages, forms, and tables in PHP and render them as real React components.
---

Lattice is a server-driven UI layer for Laravel applications running [Inertia](https://inertiajs.com/) with React. You describe your interface — pages, components, forms, tables, actions, and menus — in PHP, and Lattice serializes that description to a typed component tree that real React components render in the browser.

## The problem it solves

A typical Inertia app splits every screen across two languages: the data and rules live in PHP, while the page, its forms, and its tables are rebuilt by hand in React. The two sides duplicate the same contract — field names, validation, table columns, what an action does — and drift apart as the app grows.

Lattice removes that duplication. The server is the single source of truth for what a screen _is_; the client's only job is to render it. There is no hand-written API between them and no UI contract to keep in sync, because the renderer always receives exactly what the server produced.

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

Lattice fits teams already building Laravel + Inertia + React who want to keep their UI logic in PHP and stop maintaining a parallel front end. You still write React when you want custom components — Lattice renders them through the same registry — but the day-to-day screens come from the server.

Read the [Core Concepts](/introduction/core-concepts/) next for the mental model, then [Installation](/introduction/installation/) to add it to your app.
