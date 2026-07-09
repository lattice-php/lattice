# Schema-Based Table Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace dedicated table filters' ad hoc `accepts(mixed $value)` and TS `props` controls with a first-class schema API: filters expose form fields through `schema()`, values are validated by existing field rules, `apply()` receives `FormData`, unknown keys still 422, invalid values are dropped, empty schema filters render as toggles, and active chips use server-resolved indicators.

**Architecture:** The server owns filter validity, state normalization, query application, and indicators. `TableQuery` keeps a plain JSON-safe map of validated filter state. Eloquent sources rehydrate each active filter value into `FormData` before `apply()`. `FilterData` sends each filter's serialized field schema to React. The table filter menu renders schema nodes through the shared form renderer providers, using a narrow commit override so existing field components write into table filter state. Built-ins are reimplemented as composed schemas plus `apply()` methods.

**Tech Stack:** PHP 8.4, Laravel 13 validation, Orchestra Testbench, Pest 4, React 19, Inertia React 3, TypeScript, Vitest, existing Lattice wire component registry and generated types.

## Global Constraints

- Keep unrelated worktree changes untouched, especially untracked screenshots and Vitest attachments.
- Use existing form field validation and rendering primitives instead of duplicating validation or TS controls.
- Preserve unknown dedicated filter keys as 422 errors.
- Drop invalid values for known dedicated filters without applying them.
- Represent every active dedicated filter as an object in state and query params, including toggle filters as `{ value: "1" }`.
- Only render indicators for active filters. `indicator(FormData $data)` may return `null`; `null` means use the default indicator.
- Do not add docs pages unless separately requested. Tests may include fixture updates where required.
- Run `vendor/bin/pint --dirty --format agent` after PHP edits.

---

## Phase 1: PHP Filter Contract

- [ ] Add the new base contract in `src/Tables/Filters/Filter.php`.
  - Replace the current toggle implementation in this file with an abstract base filter.
  - Move shared state and wire serialization from `BaseFilter` into this class: `make()`, `key()`, `label()`, `attribute()`, `toData()`, `jsonSerialize()`, `wireControl()`, `column()`.
  - Add `schema(): array` returning `[]` by default.
  - Change `apply()` signature to `apply(Builder $builder, FormData $data): void`.
  - Add public `indicator(FormData $data): string|array|null` defaulting to `null`.
  - Add internal helpers for active/default indicator resolution, likely `isActive(FormData $data): bool` and `defaultIndicators(FormData $data): array`.
  - Do not keep `accepts()`.

- [ ] Add `src/Tables/Filters/ToggleFilter.php`.
  - Move the current generic/toggle filter behavior here.
  - Annotate it with `#[AsFilter(FilterControl::Toggle)]`.
  - Keep `query(Closure $query): static`.
  - Empty schema means TS renders the simple toggle.
  - `apply()` reads `$data->boolean('value')`; if no custom query is configured, apply `where($this->column(), true)`.

- [ ] Remove or retire `src/Tables/Filters/BaseFilter.php`.
  - Prefer deleting it and updating all imports to `Lattice\Lattice\Tables\Filters\Filter`.
  - If deletion causes unacceptable userland migration pain, keep a short deprecated alias class only as a temporary bridge, but do not use it internally.

- [ ] Prefix built-in filter control strings in `src/Tables/Enums/FilterControl.php`.
  - `Select = 'filter.select'`
  - `Ternary = 'filter.ternary'`
  - `DateRange = 'filter.date-range'`
  - `Toggle = 'filter.toggle'`
  - Update `AsFilter` wording/types as needed.

**Checks**

- [ ] `rtk rg "BaseFilter|accepts\\(" src tests resources/js`
- [ ] Existing filter classes compile with the new method signatures.

---

## Phase 2: Schema Validation And Normalization

- [ ] Add `src/Tables/Filters/FilterValueValidator.php`.
  - Constructor dependency: `FieldValidator`.
  - Public API:
    ```php
    public function validate(Filter $filter, mixed $raw, Request $request): ?FormData
    ```
  - Unknown key handling stays in `TableQuery`; this validator only handles a known filter.
  - Empty schema toggle path:
    - Accept object-shaped state only, using `['value' => ...]`.
    - Treat true-ish values as active and normalize to `['value' => true]` or `['value' => '1']`.
    - Treat false-ish or empty values as inactive and return `null`.
  - Schema path:
    - Require an array input.
    - Create a filter-scoped request from the current request and the raw value object.
    - Call `FieldValidator::validate($filter->schema(), $scopedRequest)`.
    - Catch `ValidationException` and return `null` so invalid values are dropped.
    - Remove empty members recursively, preserving meaningful false/0 values.
    - Return `FormData::make($validated)` when anything active remains.

- [ ] Add focused PHP tests for validation.
  - Unknown `tf[missing][value]` still returns 422.
  - Invalid known filter value is dropped and does not apply the query.
  - Invalid nested key inside a known filter is ignored through validation pruning.
  - Toggle filter accepts only active truthy object state.
  - Field `rules()` are honored before `apply()`.

**Checks**

- [ ] `rtk ./vendor/bin/pest tests/Feature/Tables/TableFilterTest.php tests/Unit/Tables/Filters --filter=filter`

---

## Phase 3: Query State, Apply, And Indicators

- [ ] Update `src/Tables/TableQuery.php`.
  - Import/use `Filter` instead of `BaseFilter`.
  - Add `tableFilterIndicators` or `filterIndicators` to the constructor and `jsonSerialize()`.
  - `parseTableFilters()` should:
    - Reject unknown keys with `InvalidTableQuery::filter(...)`.
    - Use `FilterValueValidator` for known filters.
    - Store `$data->all()` in `tableFilters`.
    - Build indicators for each active filter from the filter's override/default indicator logic.
  - Ensure empty maps still serialize as JSON objects via `Wire::map`.

- [ ] Add `src/Tables/Filters/FilterIndicator.php`.
  - Mark with `#[TypeScript]`.
  - Suggested fields: `public string $filter`, `public string $label`, `public string $value`.
  - Support one indicator string and multiple indicator arrays from `Filter::indicator()`.

- [ ] Update `src/Tables/Sources/Eloquent/EloquentTableSource.php`.
  - Rehydrate active values with `FormData::make((array) $value)`.
  - Call `$filter->apply($builder, $data)`.

- [ ] Update `src/Tables/Components/Table.php` and `src/Tables/TableRegistry.php`.
  - Use the new filter class import.
  - Generate initial empty query state with no indicators.
  - Searchable filter options should resolve against schema select fields:
    - Prefer `_search=filterKey.fieldName`.
    - Allow `_search=filterKey` as a shorthand for `value` to keep built-in select filters ergonomic.
    - Use the field's own option resolver/search logic rather than `SelectFilter` special casing.

**Checks**

- [ ] `rtk ./vendor/bin/pest tests/Feature/Tables/TableFilterTest.php`
- [ ] `rtk ./vendor/bin/pest tests/Unit/Tables/Filters`

---

## Phase 4: Built-In Filters As Schema Composition

- [ ] Update `src/Tables/Filters/SelectFilter.php`.
  - `schema()` returns a `Select` field named `value`.
  - Reuse existing option/search traits by forwarding them to the field.
  - For multiple filters, configure the schema field as multiple and set rules for accepted array shape.
  - `apply()` reads `value` from `FormData`.
  - Default indicator uses option labels where possible.

- [ ] Update `src/Tables/Filters/TernaryFilter.php`.
  - `schema()` returns a `Select` or `Choice` field named `value` with `true`/`false` options.
  - Rules should reject anything outside true/false.
  - `apply()` dispatches true/false closures or default `where($this->column(), bool)`.
  - Default indicator uses true/false labels.

- [ ] Update `src/Tables/Filters/DateRangeFilter.php`.
  - `schema()` returns `DateInput::make('from')` and `DateInput::make('until')`.
  - Rules should validate dates and allow either side independently.
  - `apply()` uses `whereDate` for present values only.
  - Default indicator joins present boundaries.

- [ ] Update tests for the renamed generic filter.
  - Replace `Filter::make(...)` usages with `ToggleFilter::make(...)` where they mean a toggle.
  - Add at least one custom schema filter fixture:
    ```php
    final class RatingFilter extends Filter
    {
        public function schema(): array
        {
            return [NumberInput::make('min')->rules(['nullable', 'integer', 'min:1'])];
        }

        public function apply(Builder $builder, FormData $data): void
        {
            $builder->where('rating', '>=', $data->integer('min'));
        }
    }
    ```

**Checks**

- [ ] `rtk ./vendor/bin/pest tests/Unit/Tables/Filters/FilterTypesTest.php tests/Unit/Tables/Filters/SelectFilterTest.php`

---

## Phase 5: TypeScript Schema Renderer

- [ ] Update `resources/js/types` contracts through PHP type generation.
  - `FilterControl` should emit prefixed values.
  - `FilterData` should include `schema: WireNode[]`.
  - `TableQuery` should include server indicators.
  - `FilterPropsMap` can be removed if no public API still consumes it; otherwise leave it temporarily unused and remove in a follow-up cleanup.

- [ ] Replace `resources/js/table/components/filter-controls.tsx`.
  - For `filter.schema.length === 0`, render the simple toggle control using object state `{ value: "1" }`.
  - For non-empty schemas, render `filter.schema` through `<Renderer />`.
  - Add a table-filter form provider component that supplies:
    - `FormProvider` with no-op validation/clear errors and table endpoint metadata for searchable fields.
    - `FormValuesProvider` seeded from the current filter value object.
    - `ResolvedNodesProvider` with an empty map initially.
    - `PrefillProvider` with no-op user edit tracking.
    - A commit override so existing field components update the filter's local value object and call `onChange(nextObject)`.
  - Avoid showing a duplicate outer label when schema fields already render their labels.

- [ ] Add a commit override to `resources/js/form/components/use-field-commit.ts` or a sibling provider.
  - Default behavior stays unchanged for normal forms.
  - Filter rendering can inject `commit/change/blur` implementations that write into table state.
  - Keep this internal to form/table modules; do not export it from the package root.

- [ ] Update `resources/js/table/filter-values.ts`, `query.ts`, `payload.ts`, and `use-table.ts`.
  - Normalize table filters as object-shaped values only.
  - Serialize `tf[key][field]=value` for every dedicated filter.
  - Drop empty members recursively while preserving `false`, `0`, and `"0"` when meaningful.
  - `setTableFilter()` receives a full object or `undefined`.
  - `searchFilterOptions()` uses `filterKey.fieldName`; built-ins use `value`.

- [ ] Update `resources/js/table/components/filter-bar.tsx`.
  - Use server indicators from `state.tableFilterIndicators`.
  - Only render chips for server-active indicators.
  - Removing an indicator removes its whole filter key.
  - The badge count uses indicator count or active filter key count consistently.

**Checks**

- [ ] `rtk npm run test -- --run resources/js/table`
- [ ] `rtk npm run typecheck`
- [ ] `rtk npm run type-coverage`

---

## Phase 6: Generated Types And Tests

- [ ] Run type generation.
  - `rtk composer types`
  - Review `resources/js/types/generated.ts` for unnecessary churn.

- [ ] Update PHP snapshot/tests.
  - `tests/Feature/TypeScript/GeneratedTypesSnapshotTest.php`
  - TypeScript command tests if the generated map shape changes.

- [ ] Update TS tests.
  - `resources/js/table/components/table-filters.test.tsx`
  - `resources/js/table/components/filter-bar.test.tsx`
  - `resources/js/table/components/searchable-filter.test.tsx`
  - `resources/js/table/filter-params.test.ts`
  - `resources/js/table/filter-values.test.ts`
  - `resources/js/table/types.test-d.ts`

- [ ] Add/adjust browser tests only if schema field interactions are not covered by Vitest.

**Checks**

- [ ] `rtk ./vendor/bin/pest tests/Feature/Tables tests/Unit/Tables tests/Feature/TypeScript`
- [ ] `rtk npm run test -- --run resources/js/table resources/js/form`

---

## Phase 7: Final Verification

- [ ] Run formatting.
  - `rtk ./vendor/bin/pint --dirty --format agent`
  - `rtk npm run format`

- [ ] Run full gates or nearest practical equivalents.
  - `rtk composer check`
  - `rtk npm run check`

- [ ] Review public API examples in tests for the intended DX:
  - `ToggleFilter::make('active')`
  - custom `Filter` subclass with `schema()`, `apply(Builder $query, FormData $data)`, optional `indicator(FormData $data)`.
  - built-ins built from schema fields, not one-off TS controls.

- [ ] Commit logical changes after green verification.

