<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\DefinitionAttribute;
use Lattice\Core\DefinitionRegistry;

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
        return $this->gatedComponent(
            $action,
            fn (string $key): ActionComponent => ActionComponent::make($key),
            function (ActionDefinition $definition, ActionComponent $component, string $key): ActionComponent {
                $component = $definition->definition($component)->endpoint($this->endpointFor($key));

                if ($definition instanceof FormActionDefinition) {
                    $component->lazyForm();
                }

                return $component;
            },
            $context,
        );
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

    #[\Override]
    protected function routeName(): string
    {
        return 'lattice.actions.handle';
    }

    public function group(): string
    {
        return 'actions';
    }
}
