---
title: Configuration
description: Discovery paths, endpoints, middleware, and registering definitions.
---

After publishing the config with `php artisan vendor:publish --tag="lattice-config"`, you can tune Lattice in `config/lattice.php`.

## Discovery

Lattice automatically discovers form, table, fragment, action, layout, and page definitions by scanning the configured paths for classes carrying the matching attribute:

```php
'discover' => [
    base_path('app'),
],
```

List every path Lattice should scan. Discovery walks the files directly, so no namespace mapping is needed.

## Registering definitions explicitly

Instead of (or in addition to) discovery, register definition classes at runtime through the `Lattice` facade — useful from a service provider:

```php
use Lattice\Lattice\Facades\Lattice;

Lattice::forms([\App\Forms\ContactForm::class]);
Lattice::tables([\App\Tables\UsersTable::class]);
```

The same method exists for `fragments`, `actions`, `bulkActions`, `layouts`, and `pages`.

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
