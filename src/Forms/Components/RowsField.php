<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\FormData;
use LogicException;

/**
 * Base for fields whose value is an ordered list of rows, each validated,
 * cast, and prefilled through the child Fields supplied by rowFields().
 *
 * Every row carries a uuid under the reserved `rowId` key: server-filled rows
 * are stamped during serialization, the client mints one for rows it creates,
 * and casting preserves (or mints) it so validated data always identifies each
 * row. Row schemas must not declare their own `rowId` field.
 *
 * @api
 */
abstract class RowsField extends Field implements ProvidesRowFields, ProvidesRowPrefills
{
    public const string ROW_ID = 'rowId';

    public ?int $minItems = null;

    public ?int $maxItems = null;

    public bool $reorderable = true;

    public ?string $addLabel = null;

    public int $defaultItems = 0;

    /**
     * The child Fields that validate and cast the given submitted row.
     *
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    abstract public function rowFields(array $row): array;

    public function minItems(int $min): static
    {
        $this->minItems = $min;

        return $this;
    }

    public function maxItems(int $max): static
    {
        $this->maxItems = $max;

        return $this;
    }

    public function reorderable(bool $reorderable = true): static
    {
        $this->reorderable = $reorderable;

        return $this;
    }

    public function addLabel(string $label): static
    {
        $this->addLabel = $label;

        return $this;
    }

    public function defaultItems(int $count): static
    {
        $this->defaultItems = $count;

        return $this;
    }

    /**
     * The rows value is always an array; array-level rules live here so they
     * are not clobbered by the nested per-row rules (which use per-index keys).
     *
     * @return array<int, mixed>
     */
    #[\Override]
    public function resolveRules(FormData $data, Request $request): array
    {
        $rules = ['array'];

        if ($this->minItems !== null) {
            $rules[] = "min:{$this->minItems}";
        }

        if ($this->maxItems !== null) {
            $rules[] = "max:{$this->maxItems}";
        }

        return $rules;
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        return $this->rulesForRows($this->rows($data), $data, $request);
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return array<string, array<int, mixed>>
     */
    protected function rulesForRows(array $rows, FormData $data, Request $request): array
    {
        $rules = [];

        foreach ($rows as $index => $row) {
            $rules = [...$rules, ...$this->rowRulesAt("{$this->name}.{$index}", is_array($row) ? $row : [], $data, $request)];
        }

        return $rules;
    }

    /**
     * The rules for one row at the given dot-notation prefix; the seam nested
     * row structures extend to validate rows below the top level.
     *
     * @param  array<string, mixed>  $row
     * @return array<string, array<int, mixed>>
     */
    protected function rowRulesAt(string $prefix, array $row, FormData $data, Request $request): array
    {
        $rules = [];
        $scope = $this->rowScope($data, $row);

        foreach ($this->rowFields($row) as $child) {
            if ($child->name() === self::ROW_ID) {
                throw new LogicException(sprintf(
                    'Row schemas must not declare a [%s] field: the key is reserved for the per-row identity.',
                    self::ROW_ID,
                ));
            }

            if (! $child->isVisible($scope)) {
                continue;
            }

            $childRules = $child->resolvedRulesWithRequired($scope, $request);

            // excludeUnvalidatedArrayKeys drops a row's unruled keys once a sibling
            // (e.g. the type discriminator) has a rule, so give every field a passthrough.
            $rules["{$prefix}.{$child->name()}"] = $childRules !== [] ? $childRules : ['sometimes', 'nullable'];
        }

        $rules["{$prefix}.".self::ROW_ID] = ['sometimes', 'nullable', 'uuid'];

        return $rules;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return [];
        }

        $originals = array_values($value);

        return array_map(
            fn (array $castRow, mixed $original): array => $this->castRow($castRow, $original),
            $this->castRows($originals),
            $originals,
        );
    }

    /**
     * Decorates one cast row with the reserved keys the child fields do not own.
     *
     * @param  array<string, mixed>  $castRow
     * @return array<string, mixed>
     */
    protected function castRow(array $castRow, mixed $original): array
    {
        return [self::ROW_ID => self::rowIdOf($original), ...$castRow];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowScope(FormData $form, array $row): FormData
    {
        return FormData::make([...$form->all(), ...$row]);
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowField(array $row, string $name): ?Field
    {
        foreach ($this->rowFields($row) as $field) {
            if ($field->name() === $name) {
                return $field;
            }
        }

        return null;
    }

    public function prefillRowFields(mixed $rows, ?FormData $form = null, ?Request $request = null): void
    {
        if (! is_array($rows)) {
            return;
        }

        $fields = [];
        $values = [];

        foreach ($rows as $row) {
            $row = is_array($row) ? $row : [];

            foreach ($this->rowFields($row) as $field) {
                $name = $field->name();

                if (! array_key_exists($name, $row)) {
                    continue;
                }

                if ($field instanceof ProvidesRowFields) {
                    $field->prefillRowFields($row[$name]);

                    continue;
                }

                $key = spl_object_id($field);
                $fields[$key] = $field;

                foreach ($this->filledRowValues($row[$name]) as $value) {
                    $values[$key][$value] = $value;
                }
            }
        }

        foreach ($values as $key => $fieldValues) {
            $fields[$key]->hydrateState(array_values($fieldValues), $form, $request);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rowPrefillValues(FormData $form, Request $request): array
    {
        $name = $this->name();
        $rows = $form->get($name);
        $rows = is_array($rows) ? $rows : [];
        $values = [];

        foreach ($rows as $index => $row) {
            $row = is_array($row) ? $row : [];
            $scope = FormData::make($row);

            foreach ($this->rowFields($row) as $child) {
                if ($child->hasPrefill()) {
                    $values["{$name}.{$index}.{$child->name()}"] = $child->resolvePrefillValue($scope, $form, $request);
                }
            }
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        if (is_array($props['value'] ?? null)) {
            $props['value'] = array_map(
                static fn (mixed $row): mixed => is_array($row)
                    ? [self::ROW_ID => self::rowIdOf($row), ...$row]
                    : $row,
                array_values($props['value']),
            );
        }

        return $props;
    }

    protected static function rowIdOf(mixed $row): string
    {
        $rowId = is_array($row) ? ($row[self::ROW_ID] ?? null) : null;

        return is_string($rowId) && Str::isUuid($rowId) ? $rowId : Str::uuid()->toString();
    }

    /**
     * @return array<int, mixed>
     */
    protected function rows(FormData $data): array
    {
        $rows = $data->get($this->name);

        return is_array($rows) ? $rows : [];
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function castRows(array $rows): array
    {
        return array_map(function (mixed $row): array {
            $row = is_array($row) ? $row : [];
            $cast = [];

            foreach ($this->rowFields($row) as $child) {
                $name = $child->name();
                $cast[$name] = $child->castValue($row[$name] ?? null);
            }

            return $cast;
        }, $rows);
    }

    /**
     * @return array<int, string>
     */
    private function filledRowValues(mixed $value): array
    {
        $values = is_array($value) ? $value : [$value];

        return array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, $values),
            static fn (string $item): bool => $item !== '',
        ));
    }
}
