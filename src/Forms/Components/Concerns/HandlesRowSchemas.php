<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\FormData;

/**
 * Per-row validation + casting for array-valued fields whose rows each render a
 * schema of child Fields. Implementers supply the template for a given row.
 */
trait HandlesRowSchemas
{
    /**
     * The child Fields that validate/cast the given submitted row. Repeater
     * returns a fixed schema; Builder resolves the block matching the row's type.
     *
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    abstract public function rowFields(array $row): array;

    /**
     * @param  array<int, mixed>  $rows
     * @return array<string, array<int, mixed>>
     */
    protected function rowRules(string $name, array $rows, FormData $data, Request $request): array
    {
        $rules = [];

        foreach ($rows as $index => $row) {
            $row = is_array($row) ? $row : [];
            $scope = $this->rowScope($data, $row);

            foreach ($this->rowFields($row) as $child) {
                if (! $child->isVisible($scope)) {
                    continue;
                }

                $childRules = $child->resolvedRulesWithRequired($scope, $request);

                // A rule entry must exist for every declared child, even one with no
                // constraints: Laravel's validated() only returns keys present in the
                // rule set, and excludeUnvalidatedArrayKeys strips a row's unruled keys
                // once any sibling (e.g. Builder's `type`) has its own rule.
                $rules["{$name}.{$index}.{$child->name()}"] = $childRules !== [] ? $childRules : ['sometimes', 'nullable'];
            }
        }

        return $rules;
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
     * @return array<int, array<string, mixed>>
     */
    protected function castRows(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_map(function ($row): array {
            $row = is_array($row) ? $row : [];
            $cast = [];

            foreach ($this->rowFields($row) as $child) {
                $name = $child->name();
                $cast[$name] = $child->castValue($row[$name] ?? null);
            }

            return $cast;
        }, $value));
    }
}
