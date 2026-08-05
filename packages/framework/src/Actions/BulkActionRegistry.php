<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Actions\Components\BulkAction as BulkActionComponent;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Core\Attributes\DefinitionAttribute;
use Lattice\Core\DefinitionRegistry;

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
