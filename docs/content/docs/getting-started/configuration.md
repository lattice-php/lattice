---
title: Configuration
description: Discovery paths, endpoints, middleware, and registering definitions.
---

After publishing the config with `php artisan vendor:publish --tag="lattice-config"`, you can tune Lattice in `config/lattice.php`.

## Discovery

Lattice can automatically discover form, table, fragment, and action definitions by scanning a path and mapping it to a namespace:

```php
'discover' => [
    base_path('app') => 'App',
],
```

Each entry maps a filesystem path to its root namespace. You may also use the array form to be explicit:

```php
'discover' => [
    ['path' => base_path('app/Lattice'), 'namespace' => 'App\\Lattice'],
],
```

## Registering definitions explicitly

Instead of (or in addition to) discovery, list definition classes under the relevant `registered` key:

```php
'forms' => [
    'registered' => [
        \App\Forms\ContactForm::class,
    ],
],
```

The same `registered` array exists for `tables`, `fragments`, `actions`, and `bulk-actions`.

You can also register at runtime through the `Lattice` facade — useful from a service provider:

```php
use Bambamboole\Lattice\Facades\Lattice;

Lattice::forms([\App\Forms\ContactForm::class]);
Lattice::tables([\App\Tables\UsersTable::class]);
Lattice::discover(app_path('Lattice'), 'App\\Lattice');
```

## Endpoints and middleware

Each definition type is served by a dedicated endpoint with its own middleware stack. The defaults:

| Type | Endpoint | Middleware |
| --- | --- | --- |
| Forms | `lattice/forms/{form}` | `web` |
| Tables | `lattice/tables/{table}` | `web` |
| Fragments | `lattice/fragments/{fragment}` | `web` |
| Actions | `lattice/actions/{action}` | `web` |
| Bulk actions | `lattice/bulk-actions/{bulkAction}` | `web` |

Add authentication or other middleware per type:

```php
'forms' => [
    'endpoint' => 'lattice/forms/{form}',
    'middleware' => ['web', 'auth'],
],
```

## Security

Component references embedded in the page payload are signed. `security.ref_lifetime` controls how long, in minutes, a signed reference stays valid:

```php
'security' => [
    'ref_lifetime' => 30,
],
```
