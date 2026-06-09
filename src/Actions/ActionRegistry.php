<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Actions\Components\Action as ActionComponent;
use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Core\DefinitionRegistry;

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

        return $this->make($action)
            ->definition(ActionComponent::make($key))
            ->endpoint($this->endpointFor($key));
    }

    /**
     * @return class-string<ActionDefinition>
     */
    protected function definitionClass(): string
    {
        return ActionDefinition::class;
    }

    /**
     * @return class-string<ComponentAttribute>
     */
    protected function attributeClass(): string
    {
        return Action::class;
    }

    protected function name(): string
    {
        return 'action';
    }

    protected function group(): string
    {
        return 'actions';
    }
}
