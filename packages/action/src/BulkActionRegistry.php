<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\BulkAction as BulkActionComponent;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BulkActionDefinition>
 */
final class BulkActionRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<BulkActionDefinition>  $bulkAction
     * @param  array<string, mixed>  $context
     */
    public function component(string $bulkAction, array $context = []): ActionComponent
    {
        return $this->gatedComponent(
            $bulkAction,
            fn (string $key): ActionComponent => BulkActionComponent::make($key),
            fn (BulkActionDefinition $definition, ActionComponent $component, string $key): ActionComponent => $definition
                ->definition($component)
                ->endpoint($this->endpointFor($key)),
            $context,
        );
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
        return AsBulkAction::class;
    }

    protected function name(): string
    {
        return 'bulkAction';
    }

    #[\Override]
    protected function routeName(): string
    {
        return 'lattice.bulk-actions.handle';
    }

    public function group(): string
    {
        return 'bulk-actions';
    }
}
