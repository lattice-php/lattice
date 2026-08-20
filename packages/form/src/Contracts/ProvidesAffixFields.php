<?php
declare(strict_types=1);

namespace Lattice\Form\Contracts;

use Lattice\Form\Components\Field;

/**
 * @api Consumed by field collection (Form::fields(), row templates); implemented
 * by fields that carry auxiliary affix fields (e.g. a currency select).
 */
interface ProvidesAffixFields
{
    /**
     * @return list<Field>
     */
    public function affixFields(): array;
}
