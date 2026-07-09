<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FieldValidator;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormSchemaWalker;

final readonly class FilterValueValidator
{
    public function __construct(private FieldValidator $fields) {}

    public function validate(Filter $filter, mixed $raw, Request $request): ?FormData
    {
        $schema = $filter->schema();

        if ($schema === []) {
            return $this->validateToggle($raw);
        }

        if (! is_array($raw)) {
            return null;
        }

        $raw = $this->sanitizeSelectValues($schema, $raw);

        try {
            $validated = $this->fields->validate(
                $this->withDefaultRules($schema),
                Request::create($request->fullUrl(), $request->method(), $raw),
            );
        } catch (ValidationException) {
            return null;
        }

        $validated = $this->prune($validated);

        return $this->hasActiveValue($validated) ? FormData::make($validated) : null;
    }

    /**
     * @param  array<int, Field>  $schema
     * @param  array<array-key, mixed>  $raw
     * @return array<array-key, mixed>
     */
    private function sanitizeSelectValues(array $schema, array $raw): array
    {
        $sanitized = $raw;

        foreach (app(FormSchemaWalker::class)->instances($schema, FormData::make($raw)) as $instance) {
            $field = $instance->field;

            if (! $field instanceof Select || $field->options === [] || ! Arr::has($sanitized, $instance->path)) {
                continue;
            }

            Arr::set($sanitized, $instance->path, $this->sanitizeSelectValue($field, Arr::get($sanitized, $instance->path)));
        }

        return $sanitized;
    }

    private function sanitizeSelectValue(Select $field, mixed $value): mixed
    {
        $allowed = array_flip($field->optionValues());

        if ($field->multiple) {
            $values = is_array($value) ? $value : [$value];

            return array_values(array_filter(
                array_map(static fn (mixed $item): string => is_scalar($item) ? (string) $item : '', $values),
                static fn (string $item): bool => $item !== '' && array_key_exists($item, $allowed),
            ));
        }

        if (! is_scalar($value)) {
            return null;
        }

        $value = (string) $value;

        return array_key_exists($value, $allowed) ? $value : null;
    }

    private function validateToggle(mixed $raw): ?FormData
    {
        if (! is_array($raw) || ! array_key_exists('value', $raw)) {
            return null;
        }

        $value = filter_var($raw['value'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $value === true ? FormData::make(['value' => true]) : null;
    }

    /**
     * @param  array<int, Field>  $schema
     * @return array<int, Field>
     */
    private function withDefaultRules(array $schema): array
    {
        return array_map(static fn (Field $field): Field => (clone $field)->rules(['nullable']), $schema);
    }

    /**
     * @param  array<array-key, mixed>  $values
     * @return array<array-key, mixed>
     */
    private function prune(array $values): array
    {
        $pruned = [];

        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $value = $this->prune($value);
            }

            if ($this->hasActiveValue($value)) {
                $pruned[$key] = $value;
            }
        }

        return $pruned;
    }

    private function hasActiveValue(mixed $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        if (is_array($value)) {
            return array_any($value, $this->hasActiveValue(...));
        }

        return true;
    }
}
