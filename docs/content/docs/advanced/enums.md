---
title: Enums reference
description: The backed enums used across Lattice builders, and their string values.
---

Lattice uses backed enums for the fixed vocabularies that appear in builders — alignments, gaps,
variants, operators, and so on. Each is generated to a TypeScript union too, so the PHP value and the
client type can't drift. The string value is what ends up on the wire.

## Layout & display

`Lattice\Lattice\Core\Enums`

| Enum             | Cases (value)                                                                 |
| ---------------- | ----------------------------------------------------------------------------- |
| `Align`          | `Center` (center), `Left` (left), `Start` (start), `Stretch` (stretch)        |
| `FloatingPlacement` | `BottomEnd` (bottom-end), `BottomStart` (bottom-start), `TopEnd` (top-end), `TopStart` (top-start) |
| `Gap`            | `ExtraSmall` (xs), `Small` (sm), `Medium` (md), `Large` (lg), `ExtraLarge` (xl) |
| `Width`          | `Full` (full), `Small` (sm), `Medium` (md), `Large` (lg), `Fill` (fill)       |
| `Orientation`    | `Horizontal` (horizontal), `Vertical` (vertical)                              |
| `PageLayout`     | `App` (app), `Auth` (auth), `None` (none)                                     |
| `PageContainer`  | `Centered` (centered), `Default` (default)                                    |

## Interactive & feedback

`Lattice\Lattice\Core\Enums`

| Enum            | Cases (value)                                                                         |
| --------------- | ------------------------------------------------------------------------------------- |
| `ButtonVariant` | `Default` (default), `Destructive` (destructive), `Ghost` (ghost), `Info` (info), `Link` (link), `Outline` (outline), `Secondary` (secondary), `Success` (success) |
| `ButtonType`    | `Button` (button), `Submit` (submit), `Reset` (reset)                                 |
| `HttpMethod`    | `Get` (get), `Post` (post), `Put` (put), `Patch` (patch), `Delete` (delete)           |
| `ToastVariant`  | `Success` (success), `Info` (info), `Warning` (warning), `Error` (error)              |

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
| `ColumnType`     | `Text` (text), `Stack` (stack)                                           |
| `FilterType`     | `Text` (text), `Number` (number), `Date` (date), `Boolean` (boolean)     |
| `PaginationType` | `None` (none), `Simple` (simple), `Table` (table), `Infinite` (infinite) |
| `SortDirection`  | `Asc` (asc), `Desc` (desc)                                               |

## Actions

`Lattice\Lattice\Actions\Enums\EffectType` — the kind of [effect](/actions/effects/) an action returns.

`Toast` (toast), `ReloadComponent` (reloadComponent), `ReloadPage` (reloadPage), `Redirect` (redirect),
`Download` (download), `OpenModal` (openModal), `CloseModal` (closeModal), `ResetForm` (resetForm).
