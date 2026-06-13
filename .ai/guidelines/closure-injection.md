# Closure Utility Injection

- Consumer closures are evaluated via the `Evaluate` facade (`Lattice\Lattice\Facades\Evaluate`),
  which resolves parameters by **name** (context utilities) and by **type** (Laravel container DI).
  Non-closures pass through unchanged.
- Form-field utilities: `$state` (full `FormData`), `$get($key, $default)` (read any field),
  `$value` (this field's own value), `$component` (the field). Prefill resolvers add `$row`/`$form`
  (the row scope and the whole-form scope); Select search resolvers add `$search` (the query string).
  `Request` and any service resolve by type.
- Add a new closure hook by accepting `Closure|T` and resolving it with
  `Evaluate::resolve($value, $context)` against the moment's `EvaluationContext`
  (built via `Field::evaluationContext()` for form fields, extended with `->named(...)` as needed).
- Reference the field by the `$component` utility, not by a typed parameter: a closure that
  type-hints a concrete field class (e.g. `fn (TextInput $field)`) resolves a FRESH container
  instance, not the live field. Use `fn ($component)`.
- Live cross-field reactivity stays in the declarative `*When` condition DSL
  (`visibleWhen`/`requiredWhen`/`disabledWhen`/`readOnlyWhen`). Closures are server-side
  (render / submit / dependent resolve round-trip) and run once per request.
