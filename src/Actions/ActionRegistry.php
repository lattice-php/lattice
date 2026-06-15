<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<ActionDefinition>
 */
final class ActionRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<ActionDefinition>  $action
     */
    public function component(string $action): ActionComponent
    {
        $key = $this->registeredKeyFor($action);

        $definition = $this->make($action);

        $component = $definition->definition(ActionComponent::make($key))
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
        return Action::class;
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
