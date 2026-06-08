<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Attributes\BulkAction;
use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BulkActionDefinition>
 */
class BulkActionRegistry extends DefinitionRegistry
{
    /**
     * @return class-string<BulkActionDefinition>
     */
    protected function definitionClass(): string
    {
        return BulkActionDefinition::class;
    }

    /**
     * @return class-string<ComponentAttribute>
     */
    protected function attributeClass(): string
    {
        return BulkAction::class;
    }

    protected function name(): string
    {
        return 'bulkAction';
    }

    protected function group(): string
    {
        return 'bulk-actions';
    }
}
