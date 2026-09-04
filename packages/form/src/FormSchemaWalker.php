<?php
declare(strict_types=1);

namespace Lattice\Form;

use Generator;
use Illuminate\Support\Arr;
use Lattice\Form\Components\Field;
use Lattice\Form\Contracts\ProvidesRowFields;

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
     * @param  array<int, string>|null  $rowSiblingNames
     * @return Generator<int, FormFieldInstance>
     */
    private function walkField(
        Field $template,
        string $path,
        FormData $scope,
        FormData $form,
        ?string $rowPath = null,
        ?array $rowSiblingNames = null,
    ): Generator {
        $field = clone $template;

        yield new FormFieldInstance($field, $path, $scope, $form, $rowPath, $rowSiblingNames);

        if (! $field instanceof ProvidesRowFields) {
            return;
        }

        $rows = Arr::get($form->all(), $path);

        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $index => $row) {
            $row = is_array($row) ? $row : [];
            $rowScope = $field->rowScope($scope, $row);
            $childRowPath = "{$path}.{$index}";
            $rowFields = $field->rowFields($row);
            $siblingNames = array_map(static fn (Field $sibling): string => $sibling->name(), $rowFields);

            foreach ($rowFields as $child) {
                yield from $this->walkField(
                    $child,
                    "{$childRowPath}.{$child->name()}",
                    $rowScope,
                    $form,
                    $childRowPath,
                    $siblingNames,
                );
            }
        }
    }
}
