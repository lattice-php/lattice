<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Field;
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
    abstract protected function rowFields(array $row): array;

    /**
     * @param  array<int, mixed>  $rows
     * @return array<string, array<int, mixed>>
     */
    protected function rowRules(string $name, array $rows, FormData $data, Request $request): array
    {
        $rules = [];

        foreach ($rows as $index => $row) {
            $row = is_array($row) ? $row : [];

            foreach ($this->rowFields($row) as $child) {
                $childRules = $child->resolvedRulesWithRequired($data, $request);

                if ($childRules !== []) {
                    $rules["{$name}.{$index}.{$child->name()}"] = $childRules;
                }
            }
        }

        return $rules;
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
