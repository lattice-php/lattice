<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Concerns;

use InvalidArgumentException;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\Components\Action;

/**
 * Lets a navigation primitive trigger a registered action with sealed context
 * instead of following an href. The action is attached as a public typed prop,
 * so it auto-serializes to a nested `action` node whose own ref seals to the
 * action endpoint.
 */
trait TriggersAction
{
    public ?Action $action = null;

    /**
     * @param  class-string<ActionDefinition>  $actionClass
     * @param  array<string, mixed>  $context
     */
    public function action(string $actionClass, array $context = []): static
    {
        return $this->bindAction($actionClass, $context);
    }

    /**
     * @param  class-string<ActionDefinition>  $actionClass
     * @param  array<string, mixed>  $context
     */
    protected function bindAction(string $actionClass, array $context = []): static
    {
        if ($this->href !== null) {
            throw new InvalidArgumentException('A navigation item bound to an action cannot also have an href; an action and an href are mutually exclusive.');
        }

        $this->action = Action::use($actionClass, $context);

        return $this;
    }
}
