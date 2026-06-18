---
title: Configuration
description: Discovery paths, endpoints, middleware, files, i18n, realtime, and registering definitions.
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

The same method exists for `fragments`, `actions`, `bulkActions`, `layouts`, `pages`, and `remoteSources`.

## Endpoints and middleware

Each definition type is served by a dedicated endpoint with its own middleware stack. The defaults all run behind `web` and `auth`:

| Type           | Endpoint                                | Middleware        |
| -------------- | --------------------------------------- | ----------------- |
| Forms          | `lattice/forms/{form}`                  | `['web', 'auth']` |
| Tables         | `lattice/tables/{table}`                | `['web', 'auth']` |
| Fragments      | `lattice/fragments/{fragment}`          | `['web', 'auth']` |
| Actions        | `lattice/actions/{action}`              | `['web', 'auth']` |
| Bulk actions   | `lattice/bulk-actions/{bulkAction}`     | `['web', 'auth']` |
| Remote sources | `lattice/remote-sources/{source}/token` | `['web', 'auth']` |

Change the endpoint or middleware stack per type:

```php
'forms' => [
    'endpoint' => 'lattice/forms/{form}',
    'middleware' => ['web', 'auth'],
],
```

## Files

[File uploads](/forms/fields/file-upload/) are stored through Laravel's filesystem. Pending uploads live under a temporary prefix and are served with short-lived signed URLs until the form is submitted:

```php
'files' => [
    'disk' => env('LATTICE_FILES_DISK', 'public'),
    'temp_prefix' => 'tmp',
    'url_ttl' => 5,
],
```

- `disk` — the storage disk uploads are written to.
- `temp_prefix` — the directory pending (not-yet-finalized) uploads are placed in.
- `url_ttl` — how long, in minutes, a temporary signed file URL stays valid.

## Internationalization

The locales Lattice exposes to the client and the [i18n](/core/i18n/) runtime:

```php
'i18n' => [
    'locales' => ['en'],
    'preload_locales' => [],
],
```

- `locales` — the locales available to the application.
- `preload_locales` — locales whose translations are bundled into the initial page payload instead of being fetched on demand. Leave empty to load every locale lazily.

## Realtime

Toggles the [realtime](/core/realtime/) broadcasting layer. When disabled, page listeners are not serialized to the client:

```php
'realtime' => [
    'enabled' => env('LATTICE_REALTIME_ENABLED', true),
],
```

## Security

Component references embedded in the page payload are signed. `security.ref_lifetime` controls how long, in minutes, a signed reference stays valid:

```php
'security' => [
    'ref_lifetime' => 30,
],
```

## TypeScript

Where `php artisan lattice:typescript` writes the generated type definitions, and the module name they are published under:

```php
'typescript' => [
    'output' => resource_path('js/lattice/generated.d.ts'),
    'module' => '@lattice-php/lattice',
],
```
