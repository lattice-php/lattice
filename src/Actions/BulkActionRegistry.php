<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\BulkAction as BulkActionComponent;
use Lattice\Lattice\Attributes\BulkAction;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BulkActionDefinition>
 */
final class BulkActionRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<BulkActionDefinition>  $bulkAction
     */
    public function component(string $bulkAction): ActionComponent
    {
        $key = $this->registeredKeyFor($bulkAction);

        return $this->make($bulkAction)
            ->definition(BulkActionComponent::make($key))
            ->endpoint($this->endpointFor($key));
    }

    /**
     * @return class-string<BulkActionDefinition>
     */
    protected function definitionClass(): string
    {
        return BulkActionDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return BulkAction::class;
    }

    protected function name(): string
    {
        return 'bulkAction';
    }

    public function group(): string
    {
        return 'bulk-actions';
    }
}
