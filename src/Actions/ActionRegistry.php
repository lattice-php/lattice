<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Components\Action as ActionComponent;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use ReflectionClass;

class ActionRegistry
{
    /**
     * @var array<string, class-string<ActionDefinition>>
     */
    private array $actions = [];

    public function __construct(private readonly Container $container) {}

    /**
     * @param  class-string<ActionDefinition>|array<int, class-string<ActionDefinition>>  $actions
     */
    public function register(string|array $actions): void
    {
        foreach ((array) $actions as $action) {
            $this->actions[$this->keyFor($action)] = $action;
        }
    }

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

    public function resolve(string $key): ActionDefinition
    {
        if (! array_key_exists($key, $this->actions)) {
            throw new InvalidArgumentException("Lattice action [{$key}] is not registered.");
        }

        return $this->make($this->actions[$key]);
    }

    public function endpointFor(string $key): string
    {
        $endpoint = (string) config('lattice.actions.endpoint', 'lattice/actions/{action}');
        $path = str_replace('{action}', rawurlencode($key), ltrim($endpoint, '/'));

        return '/'.$path;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    private function registeredKeyFor(string $action): string
    {
        $key = $this->keyFor($action);

        if (($this->actions[$key] ?? null) !== $action) {
            throw new InvalidArgumentException("Lattice action [{$action}] is not registered.");
        }

        return $key;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    private function keyFor(string $action): string
    {
        if (! is_subclass_of($action, ActionDefinition::class)) {
            throw new InvalidArgumentException("Lattice action [{$action}] must extend [".ActionDefinition::class.'].');
        }

        $attribute = (new ReflectionClass($action))->getAttributes(Action::class)[0] ?? null;

        if ($attribute === null) {
            throw new InvalidArgumentException("Lattice action [{$action}] is missing the [Action] attribute.");
        }

        return $attribute->newInstance()->key;
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    private function make(string $action): ActionDefinition
    {
        return $this->container->make($action);
    }
}
