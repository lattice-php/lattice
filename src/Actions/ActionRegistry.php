<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<ActionDefinition>
 */
final class ActionRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<ActionDefinition>  $action
     * @param  array<string, mixed>  $context
     */
    public function component(string $action, array $context = []): ActionComponent
    {
        $key = $this->registeredKeyFor($action);

        $definition = $this->make($action)->withContext($context);

        if (! $definition->authorize($this->container->make(Request::class))) {
            return ActionComponent::make($key)->hidden();
        }

        $component = $definition->definition(ActionComponent::make($key))
            ->signedAs($key)
            ->context($context)
            ->endpoint($this->endpointFor($key));

        if ($definition instanceof FormActionDefinition) {
            $component->lazyForm();
        }

        return $component;
    }

    /**
     * @return class-string<ActionDefinition>
     */
    protected function definitionClass(): string
    {
        return ActionDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsAction::class;
    }

    protected function name(): string
    {
        return 'action';
    }

    public function group(): string
    {
        return 'actions';
    }
}
