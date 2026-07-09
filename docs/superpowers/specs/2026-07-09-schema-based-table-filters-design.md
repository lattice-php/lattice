# Schema-based table filters

## Problem

Dedicated table filters currently have two mismatched halves:

- Server-side filters own validation through `accepts(mixed $value): bool` and
  query behavior through `apply(Builder $builder, mixed $value): void`.
- Client-side filters render through a hardcoded switch over built-in controls
  (`select`, `ternary`, `date-range`, `toggle`) and cannot render a custom filter
  even though PHP already allows `#[AsFilter('custom-type')]`.

This creates a second validation model beside Lattice forms. It also makes custom
filter DX worse than custom fields: a user must invent a value shape, validate it
manually, render it manually, and format active chips manually.

The desired API should reuse the field system. Form fields already provide UI,
rules, casting, closure utility injection, nested field support, labels, and
conditions. Filters should compose those capabilities instead of duplicating them.

## Goals

- Replace public `accepts()` with schema-driven validation through normal Lattice
  fields and their `->rules()` modifiers.
- Make a filter's value shape consistent: every dedicated filter posts an object
  keyed by schema field name.
- Keep unknown filter keys strict (`422`) while dropping invalid values for known
  filters, so stale/shared table URLs stay resilient.
- Make empty-schema filters render as a simple toggle.
- Keep built-in filters as ergonomic wrappers, but implement them as schemas plus
  `apply()`.
- Add active-filter indicators that default from schema field labels/values and
  can be overridden per filter.
- Defer TS-only custom filter controls until the schema path proves where the
  remaining gap is.

## Chosen API

The abstract filter base becomes `Filter`; the current generic toggle filter is
renamed to `ToggleFilter`.

```php
abstract class Filter
{
    /**
     * @return array<int, Field>
     */
    public function schema(): array
    {
        return [];
    }

    abstract public function apply(Builder $query, FormData $data): void;

    public function indicator(FormData $data): string|array|null
    {
        return null;
    }
}
```

### Empty schema

An empty schema is a built-in toggle control:

- inactive: no `tf[filter]` key
- active: `tf[filter][value]=1`
- `apply()` is called only when active
- `FormData` contains the normalized `value`
- default indicator is the filter label

This keeps a simple custom filter tiny:

```php
final class HighValueFilter extends Filter
{
    public function apply(Builder $query, FormData $data): void
    {
        $query->where('price', '>', 1000);
    }
}
```

### Non-empty schema

A non-empty schema renders the returned form fields in the table filter popover:

```php
final class RatingFilter extends Filter
{
    public function schema(): array
    {
        return [
            NumberInput::make('min', 'Minimum rating')
                ->rules(['nullable', 'integer', 'min:1', 'max:5']),
        ];
    }

    public function apply(Builder $query, FormData $data): void
    {
        $query->where('rating', '>=', $data->integer('min'));
    }

    public function indicator(FormData $data): ?string
    {
        return $data->integer('min').'+ stars';
    }
}
```

Lattice validates the schema before `apply()` is called. Since `indicator()` is
only called for active filters, consumers do not need to guard with
`$data->filled(...)` unless they are intentionally composing a partial summary.

If `indicator()` returns `null`, Lattice uses the default schema-derived
indicator. If it returns a string or array, that return value is used instead.

## Wire Shape

Dedicated filter state becomes consistently object-shaped:

```txt
tf[status][value]=active
tf[rating][min]=4
tf[created][from]=2026-01-01
tf[created][until]=2026-06-30
```

The built-in single-value filters use a conventional `value` field internally.
This removes the current scalar-or-array-or-object split in table filter state.

## Validation Semantics

For each submitted dedicated filter:

1. If the filter key is not declared by the table, return `422`.
2. If the filter key is declared, validate its submitted value object against the
   filter schema using the existing form field validation pipeline.
3. If validation fails, drop that filter value from the query state.
4. If validation passes but the validated data is empty, treat the filter as
   inactive.
5. If active, call `apply($query, $data)` and compute indicators.

This intentionally differs from form submission. Table filters are URL/query
state; invalid declared values should not break old links or hand-edited URLs.
Unknown keys remain strict because they indicate an unsupported query contract.

## Indicators

Indicators are the active filter chips shown above the table. They are display
only; they do not validate and do not affect the query.

Default indicator behavior:

- Empty schema: use the filter label.
- One active field: use the field label and formatted value.
- Multiple active fields: use each active field label and formatted value, or a
  compact combined string when the field types have an obvious pair semantics
  such as date ranges.

Custom indicator behavior:

```php
public function indicator(FormData $data): string|array|null
{
    return $data->integer('min').'+ stars';
}
```

- `null`: use the default indicator.
- `string`: render one chip for the filter.
- `array`: render multiple chips for the filter.

## Built-in Filters

Built-ins stay as first-class DX wrappers, but are implemented through the same
schema and apply contract:

- `SelectFilter`: schema is a `Select::make('value', ...)`; `apply()` performs
  `where` or `whereIn`.
- `TernaryFilter`: schema is a select/choice field named `value`; `apply()` uses
  true/false query branches.
- `DateRangeFilter`: schema contains `from` and `until` date fields; `apply()`
  adds inclusive bounds.
- `ToggleFilter`: empty schema plus optional query closure.

The former `Filter` class name becomes the abstract base. The former generic
toggle behavior moves to `ToggleFilter`.

## Type Strings

Built-in filter type strings become prefixed:

- `filter.select`
- `filter.ternary`
- `filter.date-range`
- `filter.toggle`

Custom filters should also use `filter.*` strings. This aligns filters with
`field.*` and `column.*` and removes the current one-off unprefixed dispatch
vocabulary.

## TypeScript Runtime

The main path renders schema fields, not custom filter controls. The table filter
popover receives a filter schema and uses the existing renderer/form-field
infrastructure to render it.

The TS-only filter-control registry remains deferred. After schema-based filters
exist, reassess whether there are real controls that cannot be expressed as
Lattice fields. If yes, add a narrow escape hatch then.

## Affected Units

- `src/Tables/Filters/BaseFilter.php` or successor base class: replace
  `accepts()`/`apply(mixed)` with `schema()`/`apply(FormData)`/`indicator()`.
- `src/Tables/Filters/Filter.php`: rename current generic toggle to
  `ToggleFilter`.
- `src/Tables/Filters/{SelectFilter,TernaryFilter,DateRangeFilter}`: rewrite as
  schema-composed filters.
- `src/Tables/TableQuery.php`: parse object-shaped `tf`, reject unknown keys,
  drop invalid declared values.
- `src/Tables/TableRegistry.php` and table source flow: pass validated `FormData`
  to `apply()`.
- `resources/js/table/**`: render filter schemas, normalize table filter state to
  object shape, and derive active indicators from server-provided/default data.
- generated TS types: update filter type strings and the filter state shape.
- Docs: explicitly document unknown keys vs invalid value behavior.

## Acceptance

- A filter with empty schema renders as a toggle and applies only when active.
- A filter with schema fields validates through the same field rules used by
  forms before `apply()` runs.
- Invalid values for declared filters are dropped from table query state.
- Unknown filter keys still return `422`.
- Dedicated filter state always uses object-shaped `tf[filter][field]` params.
- Built-in filters keep their public DX while using schema composition internally.
- `indicator()` can override active chips, and `null` falls back to the default.
- Built-in filter type strings are prefixed with `filter.*`.
- Custom TS-only controls are not implemented in this pass.
