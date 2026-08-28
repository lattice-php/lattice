<?php
declare(strict_types=1);

namespace Lattice\Form\Components\Concerns;

use Lattice\Form\Components\Field;
use Lattice\Form\Contracts\ProvidesAffixFields;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\ContainerComponent;

/**
 * Collects the Fields of a schema through layout containers (Grid, Stack),
 * including each field's affix fields. Fields themselves stay atomic — a
 * nested rows field owns its children via ProvidesRowFields.
 */
trait CollectsSchemaFields
{
    /**
     * @param  array<int, Component>  $children
     * @return array<int, Field>
     */
    protected function collectFields(array $children): array
    {
        $fields = [];

        foreach ($children as $child) {
            if ($child instanceof Field) {
                $fields = [...$fields, $child, ...$this->affixFieldsOf($child)];

                continue;
            }

            if ($child instanceof ContainerComponent) {
                foreach ($child->descendants() as $descendant) {
                    if ($descendant instanceof Field) {
                        $fields = [...$fields, $descendant, ...$this->affixFieldsOf($descendant)];
                    }
                }
            }
        }

        return $fields;
    }

    /**
     * @return list<Field>
     */
    private function affixFieldsOf(Field $field): array
    {
        return $field instanceof ProvidesAffixFields ? $field->affixFields() : [];
    }
}
