---
title: Artisan commands
description: Reference for the Lattice Artisan commands that scaffold definitions, generate types, and manage discovery.
---

Lattice registers its commands under the `lattice` namespace. Inspect the current list in an
application with:

```bash
php artisan list lattice
```

## Definition generators

These commands create PHP-only definition classes under `app/`. Each accepts a required `name`
argument and `--force` to overwrite an existing file.

| Command                                    | Writes to          | Base class                |
| ------------------------------------------ | ------------------ | ------------------------- |
| `php artisan lattice:page Home`            | `app/Ui/Pages`     | `Page`                    |
| `php artisan lattice:form Contact`         | `app/Ui/Forms`     | `FormDefinition`          |
| `php artisan lattice:table Users`          | `app/Ui/Tables`    | `EloquentTableDefinition` |
| `php artisan lattice:action Save`          | `app/Ui/Actions`   | `ActionDefinition`        |
| `php artisan lattice:bulk-action Export`   | `app/Ui/Actions`   | `BulkActionDefinition`    |
| `php artisan lattice:fragment Stats`       | `app/Ui/Fragments` | `FragmentDefinition`      |
| `php artisan lattice:layout App`           | `app/Ui/Layouts`   | `LayoutDefinition`        |
| `php artisan lattice:remote-source Search` | `app/Ui/Remote`    | `RemoteSourceDefinition`  |

A bare name lands under `App\Ui\{Type}` — a single UI (adapter) layer that keeps
your generated Lattice classes separate from your domain code.

### Placing a class explicitly

Give the name a path separator and it is written verbatim under `App\` — the
type folder is _not_ inserted, so you own the whole location. This is the escape
hatch for feature-first apps that group by feature rather than by type:

```bash
php artisan lattice:form Projects/Ui/Forms/ProfileForm
```

That writes `app/Projects/Ui/Forms/ProfileForm.php` with the namespace
`App\Projects\Ui\Forms`. `/` and `\` are interchangeable, so you never need to
escape backslashes in your shell. Discovery scans `app/` recursively, so classes
found under either layout are registered the same way — no config change needed.

## Component-pair generators

These commands create both the PHP class and the React renderer, then append the registration to
`resources/js/registry.ts`.

| Command                                  | PHP file                | React file                              | Registry                      |
| ---------------------------------------- | ----------------------- | --------------------------------------- | ----------------------------- |
| `php artisan lattice:field ColorPicker`  | `app/Ui/Forms/Fields`   | `resources/js/fields/color-picker.tsx`  | `components`                  |
| `php artisan lattice:component Rating`   | `app/Ui/Components`     | `resources/js/components/rating.tsx`    | `components`                  |
| `php artisan lattice:column StatusBadge` | `app/Ui/Tables/Columns` | `resources/js/columns/status-badge.tsx` | `extensions["table.columns"]` |

The PHP class follows the same `App\Ui` default and separator escape hatch as
the definition generators; the React file and registry entry are keyed by the
resolved class name. Package mode (`--package`) is unaffected — it uses the
package's own PSR-4 namespace.

Publish the registry scaffold before running them:

```bash
php artisan vendor:publish --tag=lattice-js
```

All three accept:

| Option       | Purpose                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `--type=`    | Override the derived type string.                                                                |
| `--package=` | Scaffold into a Composer [component package](/extending/component-packages/) instead of the app. |
| `--force`    | Overwrite generated files that already exist. Existing registry entries are not duplicated.      |

By default, `ColorPicker` becomes `field.color-picker`, `Rating` becomes `rating`, and `StatusBadge`
becomes `column.status-badge`. The commands run `lattice:typescript` after updating the registry so
the renderer props are narrowed immediately.

## Type generation

Run the TypeScript generator when custom Lattice classes gain or lose public props:

```bash
php artisan lattice:typescript
```

It scans `config('lattice.discover')`, reads the discovered component, field, and column classes, and
writes the declaration file configured at `config('lattice.typescript.output')`
(`resources/js/lattice/generated.d.ts` by default). The generated file augments the configured module
(`@lattice-php/core` by default), so `node.props` and `column.props` stay typed on the client.

`lattice:typescript` only needs `spatie/laravel-typescript-transformer` when your app defines custom
PHP wire types; it no-ops otherwise. Install it as a dev dependency in applications that generate
types for custom components.

## Discovery cache

Discovery scans the configured paths for Lattice attributes. Cache that manifest for production:

```bash
php artisan lattice:discover-cache
```

Clear it when the discovered classes or paths change:

```bash
php artisan lattice:discover-clear
```

Lattice also registers these with Laravel's optimization flow, so the cache command runs with
`php artisan optimize` and the clear command runs with `php artisan optimize:clear`.

## Assets & maintenance

`php artisan lattice:assets` publishes the prebuilt standalone assets into your public directory —
the [no-build installation](/introduction/no-build/) covers when and why.

`php artisan lattice:notifications:prune` deletes read [notifications](/components/notifications/)
older than the configured `lattice.notifications.prune_after_days` (unread ones are never pruned) —
schedule it daily.

## Common workflow

```bash
php artisan vendor:publish --tag=lattice-config
php artisan vendor:publish --tag=lattice-js

php artisan lattice:page Dashboard
php artisan lattice:form ProfileForm
php artisan lattice:field ColorPicker --type=color-picker

php artisan lattice:typescript
```

Use the [registry and types](/extending/registry-and-types/) page for the generated React registry,
and [configuration](/introduction/configuration/) for the `discover` and `typescript` settings these
commands read.
