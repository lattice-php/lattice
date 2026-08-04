<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Generator;
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
        return iterator_to_array($this->walk($fields, $form), false);
    }

    /**
     * @param  iterable<int, Field>  $fields
     */
    public function find(iterable $fields, string $path, FormData $form): ?FormFieldInstance
    {
        foreach ($this->walk($fields, $form) as $instance) {
            if ($instance->path === $path) {
                return $instance;
            }
        }

        return null;
    }

    /**
     * @param  iterable<int, Field>  $fields
     * @return Generator<int, FormFieldInstance>
     */
    private function walk(iterable $fields, FormData $form): Generator
    {
        foreach ($fields as $field) {
            yield from $this->walkField($field, $field->name(), $form, $form);
        }
    }

    /**
     * @return Generator<int, FormFieldInstance>
     */
    private function walkField(Field $template, string $path, FormData $scope, FormData $form): Generator
    {
        $field = clone $template;

        yield new FormFieldInstance($field, $path, $scope, $form);

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
                yield from $this->walkField(
                    $child,
                    "{$path}.{$index}.{$child->name()}",
                    $rowScope,
                    $form,
                );
            }
        }
    }
}
