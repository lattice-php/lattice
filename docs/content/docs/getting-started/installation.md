---
title: Installation
description: Install the Lattice package into a Laravel and Inertia application.
---

Lattice adds a server-driven UI layer to a Laravel application running [Inertia](https://inertiajs.com/) with the React adapter.

## Requirements

| Requirement | Version |
| --- | --- |
| PHP | 8.4+ |
| Laravel | 11, 12, or 13 |
| Inertia (Laravel + React) | v3 |
| React | 19 |
| Tailwind CSS | 4 |

## How Lattice is delivered

Lattice ships as two coordinated packages:

- **`lattice-php/lattice`** on Composer — the PHP layer that describes pages, forms, tables, actions, and menus and serializes them to typed component trees.
- **`@lattice-php/lattice`** on npm — the React renderer that turns those trees into rendered UI in the browser.

Both packages are cut from the same release, so a given Composer version always has a matching npm version — the renderer can't drift from the server that serialized the page. Install the Composer package below, then add the npm package in [Frontend Setup](/getting-started/frontend-setup/).

## Install the package

```bash
composer require lattice-php/lattice
```

The service provider is registered automatically through Laravel package discovery, so there is nothing to add to `bootstrap/providers.php`.

## Publish the configuration

Publish `config/lattice.php` to customize discovery paths, endpoints, and middleware:

```bash
php artisan vendor:publish --tag="lattice-config"
```

See [Configuration](/getting-started/configuration/) for what each option controls.

## Set up the frontend

Install the React renderer and wire it into your Inertia entrypoint once: add the npm package, import its stylesheet, and register the page component. Follow [Frontend Setup](/getting-started/frontend-setup/).

## Next steps

- [Frontend Setup](/getting-started/frontend-setup/) — wire the React renderer into Inertia.
- [Quickstart](/getting-started/quickstart/) — build and route your first page.
- [Configuration](/getting-started/configuration/) — discovery, endpoints, and middleware.
</content>
