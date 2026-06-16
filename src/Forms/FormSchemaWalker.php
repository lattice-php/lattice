<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Support\Arr;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;

final class FormSchemaWalker
{
    /**
     * @param  iterable<int, Field>  $fields
     * @return array<int, FormFieldInstance>
     */
    public function instances(iterable $fields, FormData $form): array
    {
        $instances = [];

        foreach ($fields as $field) {
            $this->walkField($instances, $field, $field->name(), $form, $form);
        }

        return $instances;
    }

    /**
     * @param  iterable<int, Field>  $fields
     */
    public function find(iterable $fields, string $path, FormData $form): ?FormFieldInstance
    {
        foreach ($this->instances($fields, $form) as $instance) {
            if ($instance->path === $path) {
                return $instance;
            }
        }

        return null;
    }

    /**
     * @param  array<int, FormFieldInstance>  $instances
     */
    private function walkField(array &$instances, Field $template, string $path, FormData $scope, FormData $form): void
    {
        $field = clone $template;

        $instances[] = new FormFieldInstance($field, $path, $scope, $form);

        if (! $field instanceof ProvidesRowFields) {
            return;
        }

        $rows = Arr::get($form->all(), $path);

        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $index => $row) {
            $row = is_array($row) ? $row : [];
            $rowScope = FormData::make([...$scope->all(), ...$row]);

            foreach ($field->rowFields($row) as $child) {
                $this->walkField(
                    $instances,
                    $child,
                    "{$path}.{$index}.{$child->name()}",
                    $rowScope,
                    $form,
                );
            }
        }
    }
}
