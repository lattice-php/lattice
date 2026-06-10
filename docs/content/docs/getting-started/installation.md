---
title: Installation
description: Install the Lattice package into a Laravel and Inertia application.
---

Lattice is a Composer package that adds a server-driven UI layer to a Laravel application running [Inertia](https://inertiajs.com/) with the React adapter.

## Requirements

| Requirement | Version |
| --- | --- |
| PHP | 8.4+ |
| Laravel | 11, 12, or 13 |
| Inertia (Laravel + React) | v3 |
| React | 19 |
| Tailwind CSS | 4 |

## How Lattice is delivered

Lattice ships as a single Composer package that contains both halves of the framework:

- The **PHP layer** that describes pages, forms, tables, actions, and menus and serializes them to typed component trees.
- The **React renderer** (TypeScript source under `resources/js`) that turns those trees into rendered UI in the browser.

There is no separate npm package. Because both halves arrive from one `composer require`, the renderer always matches the server that serialized the page — the two can never drift apart. You point your existing Vite build at the renderer source with a single alias, covered in [Frontend Setup](/getting-started/frontend-setup/).

## Install the package

```bash
composer require lattice/lattice
```

The service provider is registered automatically through Laravel package discovery, so there is nothing to add to `bootstrap/providers.php`.

## Publish the configuration

Publish `config/lattice.php` to customize discovery paths, endpoints, and middleware:

```bash
php artisan vendor:publish --tag="lattice-config"
```

See [Configuration](/getting-started/configuration/) for what each option controls.

## Set up the frontend

The React renderer lives inside the installed package. You wire it into your Inertia entrypoint once: install its JavaScript dependencies, alias the package, import its stylesheet, and register the page component. Follow [Frontend Setup](/getting-started/frontend-setup/).

## Next steps

- [Frontend Setup](/getting-started/frontend-setup/) — wire the React renderer into Inertia.
- [Quickstart](/getting-started/quickstart/) — build and route your first page.
- [Configuration](/getting-started/configuration/) — discovery, endpoints, and middleware.
</content>
</invoke>
