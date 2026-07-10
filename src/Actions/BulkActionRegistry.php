<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Http\Request;
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
        $key = $this->registeredKeyFor($bulkAction);
        $definition = $this->make($bulkAction)->withContext($context);

        if (! $definition->authorize($this->container->make(Request::class))) {
            return BulkActionComponent::make($key)->hidden();
        }

        return $definition
            ->definition(BulkActionComponent::make($key))
            ->signedAs($key)
            ->context($context)
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
        return AsBulkAction::class;
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
