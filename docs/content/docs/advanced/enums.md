---
title: Enums reference
description: The backed enums used across Lattice builders, and their string values.
---

Lattice uses backed enums for the fixed vocabularies that appear in builders — alignments, gaps,
variants, operators, and so on. Each is generated to a TypeScript union too, so the PHP value and the
client type can't drift. The string value in parentheses is what ends up on the wire.

## Layout & spacing

`Lattice\Lattice\Core\Enums` — the vocabulary for arranging components, used by `Stack` and the other
layout primitives.

| Enum                | Cases (value)                                                                          |
| ------------------- | -------------------------------------------------------------------------------------- |
| `Align`             | `Center` (center), `Left` (left), `Start` (start), `Stretch` (stretch)                  |
| `Justify`           | `Start` (start), `Center` (center), `End` (end), `Between` (between), `Around` (around), `Evenly` (evenly) |
| `Gap`               | `None` (none), `ExtraSmall` (xs), `Small` (sm), `Medium` (md), `Large` (lg), `ExtraLarge` (xl) |
| `Width`             | `Full` (full), `Small` (sm), `Medium` (md), `Large` (lg), `Fill` (fill)                 |
| `Height`            | `Full` (full), `Screen` (screen)                                                        |
| `Orientation`       | `Horizontal` (horizontal), `Vertical` (vertical)                                        |
| `Placement`         | `Top` (top), `Bottom` (bottom), `Right` (right)                                         |
| `FloatingPlacement` | `BottomEnd` (bottom-end), `BottomStart` (bottom-start), `TopEnd` (top-end), `TopStart` (top-start) |

## Pages

`Lattice\Lattice\Core\Enums` — how a [page](/core/pages/) frames itself and which
[layout](/core/layouts/) it renders into.

| Enum            | Cases (value)                                          |
| --------------- | ----------------------------------------------------- |
| `PageLayout`    | `App` (app), `Auth` (auth), `None` (none)             |
| `PageContainer` | `Centered` (centered), `Default` (default)            |

## Text & sizing

`Lattice\Lattice\Core\Enums` — sizing and color for `Text`, `Icon`, table columns, and form-field
width.

| Enum          | Cases (value)                                                                          |
| ------------- | -------------------------------------------------------------------------------------- |
| `Size`        | `Xs` (xs), `Sm` (sm), `Md` (md), `Lg` (lg), `Xl` (xl)                                   |
| `Color`       | `Default` (default), `Muted` (muted), `Primary` (primary), `Success` (success), `Info` (info), `Warning` (warning), `Danger` (danger) |
| `ColumnWidth` | `Xs` (xs), `Sm` (sm), `Md` (md), `Lg` (lg), `Xl` (xl)                                   |

The icon names a `Lattice\Lattice\Core\Enums\Icon` accepts are listed on the [Icons](/core/icons/) page.

## Buttons & feedback

`Lattice\Lattice\Core\Enums`

| Enum            | Cases (value)                                                                          |
| --------------- | -------------------------------------------------------------------------------------- |
| `ButtonVariant` | `Default` (default), `Destructive` (destructive), `Ghost` (ghost), `Info` (info), `Link` (link), `Outline` (outline), `Secondary` (secondary), `Success` (success) |
| `ButtonType`    | `Button` (button), `Submit` (submit), `Reset` (reset)                                  |
| `HttpMethod`    | `Get` (get), `Post` (post), `Put` (put), `Patch` (patch), `Delete` (delete)            |
| `Variant`       | `Success` (success), `Info` (info), `Warning` (warning), `Error` (error) — used by toasts and [callouts](/actions/effects/#callouts). |

## Operators

`Lattice\Lattice\Core\Enums\Op` — the shared comparison vocabulary used by both
[form conditions](/forms/conditional-fields/#operators) and [table filters](/tables/sorting-filtering-pagination/#filtering).

`Contains` (contains), `StartsWith` (starts_with), `EndsWith` (ends_with), `Equals` (eq),
`NotEquals` (neq), `GreaterThan` (gt), `GreaterThanOrEqual` (gte), `LessThan` (lt),
`LessThanOrEqual` (lte), `In` (in), `NotIn` (not_in), `Before` (before), `After` (after),
`Empty` (empty), `Filled` (filled).

## Tables

`Lattice\Lattice\Tables\Enums`

| Enum             | Cases (value)                                                            |
| ---------------- | ------------------------------------------------------------------------ |
| `ColumnType`     | `Text` (text), `Stack` (stack), `Badge` (badge), `Icon` (icon), `Image` (image) |
| `FilterType`     | `Text` (text), `Number` (number), `Date` (date), `Boolean` (boolean)     |
| `PaginationType` | `None` (none), `Simple` (simple), `Table` (table), `Infinite` (infinite) |
| `SortDirection`  | `Asc` (asc), `Desc` (desc)                                               |

## Forms

The row layout and built-in row actions used by the [repeater and builder](/forms/fields/repeater/)
fields.

| Enum            | Namespace                       | Cases (value)                    |
| --------------- | ------------------------------- | -------------------------------- |
| `RowLayout`     | `Lattice\Lattice\Core\Enums`    | `Stack` (stack), `Table` (table) |
| `RowActionType` | `Lattice\Lattice\Forms\Enums`   | `Duplicate` (duplicate), `Remove` (remove) |

## Actions

`Lattice\Lattice\Actions\Enums\EffectType` — the kind of [effect](/actions/effects/) an action returns.

`Toast` (toast), `Callout` (callout), `ReloadComponent` (reloadComponent), `ReloadPage` (reloadPage),
`Redirect` (redirect), `Download` (download), `OpenModal` (openModal), `CloseModal` (closeModal),
`ResetForm` (resetForm), `LocaleChange` (localeChange).
</content>
