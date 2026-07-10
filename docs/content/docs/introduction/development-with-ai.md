---
title: Development with AI
description: Lattice ships Laravel Boost guidelines and skills so AI coding agents know how to build Lattice pages, forms, tables, and actions.
---

Lattice is a natural fit for AI-assisted development. Because the whole UI is described in PHP, an agent that knows Lattice's APIs can build entire screens — pages, forms, tables, actions — without anyone hand-writing the React. To make that reliable, Lattice ships first-class support for [Laravel Boost](https://github.com/laravel/boost), the toolkit that gives agents Laravel-aware context.

## Laravel Boost

[Laravel Boost](https://laravel.com/docs/boost) is an MCP server plus a bundle of AI guidelines and skills for coding agents. Install it in your application:

```bash
composer require laravel/boost --dev
php artisan boost:install
```

`boost:install` registers the MCP server — so the agent can inspect your database, models, routes, and search the Laravel ecosystem docs — and writes guideline files (`CLAUDE.md`, `AGENTS.md`, …) and skills for the agents you select, scoped to the packages you actually have installed. Lattice is one of them.

## What Lattice contributes

When Boost runs in an app that has Lattice installed, it discovers the guidelines and skills Lattice ships, so your agent learns Lattice's conventions automatically:

- **Core guideline** — always loaded. A compact overview of the server-driven model, how to build and route a page, the building blocks, the discovery and configuration conventions, and the `lattice:*` artisan commands.
- **`lattice-forms` skill** — building [forms](/forms/overview/): fields, `Select`/`Choice` options, validation and live Precognition, conditional and computed fields, and the submit lifecycle.
- **`lattice-tables` skill** — building [tables](/tables/overview/): columns, the Eloquent builder, sortable and filterable columns, custom data sources, and row & bulk actions.
- **`lattice-actions` skill** — [actions](/actions/overview/) and bulk actions: `ActionResult` effects, confirmation and input-form modals, and authorization.

Guidelines load up front so the agent always has the mental model; skills load on demand when the agent works in that area, which keeps its context focused. See [Guidelines vs. Skills](https://laravel.com/docs/boost#guidelines-vs-skills) in the Boost docs for the distinction.

## Keeping them current

Lattice's guidelines and skills are versioned with the package. After upgrading Lattice — or any ecosystem package — refresh the generated resources:

```bash
php artisan boost:update
```

Add `--discover` to let Boost scan for newly installed packages and offer to publish their guidelines and skills:

```bash
php artisan boost:update --discover
```

:::tip
If your app also has npm-managed frontend packages, run the refresh after `npm install` so Boost can discover package-specific skills such as React, Inertia, and Tailwind.
:::

## A habit worth keeping

One Lattice-specific step the core guideline already teaches your agent — worth knowing yourself: after changing the PHP wire format (enums, value objects) or adding a custom component, field, or column, regenerate the TypeScript types so the React side stays in lockstep.

```bash
php artisan lattice:typescript
```
