---
title: Installation
description: Install the Lattice package into a Laravel and Inertia application.
---

Lattice is a Composer package that adds a server-driven UI layer to a Laravel application running [Inertia](https://inertiajs.com/) with the React adapter.

## Requirements

| Requirement | Version |
| --- | --- |
| PHP | 8.3+ |
| Laravel | 11, 12, or 13 |
| Inertia (Laravel + React) | v3 |
| React | 19 |

## Install the package

```bash
composer require bambamboole/lattice
```

The service provider is registered automatically through Laravel package discovery, so there is nothing to add to `bootstrap/providers.php`.

## Publish the configuration

Publish `config/lattice.php` to customize discovery paths, endpoints, and middleware:

```bash
php artisan vendor:publish --tag="lattice-config"
```

See [Configuration](/getting-started/configuration/) for what each option controls.

## Set up the frontend

Lattice ships the React renderer that turns serialized component trees into rendered UI. You wire it into your Inertia entrypoint once. Follow [Frontend Setup](/getting-started/frontend-setup/) to install the JavaScript dependencies and register the renderer.

## Next steps

- [Quickstart](/getting-started/quickstart/) — build and route your first page.
- [Configuration](/getting-started/configuration/) — discovery, endpoints, and middleware.
- [Frontend Setup](/getting-started/frontend-setup/) — wire the React renderer into Inertia.
