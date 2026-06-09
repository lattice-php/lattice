<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core;

use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Contracts\DefinitionRegistry as DefinitionRegistryContract;
use Bambamboole\Lattice\Exceptions\UnknownLatticeComponent;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use Spatie\Attributes\Attributes;

/**
 * @template TDefinition of Definition
 *
 * @implements DefinitionRegistryContract<TDefinition>
 */
abstract class DefinitionRegistry implements DefinitionRegistryContract
{
    /**
     * @var array<string, class-string<TDefinition>>
     */
    protected array $definitions = [];

    public function __construct(protected readonly Container $container) {}

    /**
     * @param  class-string<TDefinition>|array<int, class-string<TDefinition>>  $definitions
     */
    public function register(string|array $definitions): void
    {
        foreach ((array) $definitions as $definition) {
            $this->definitions[$this->keyFor($definition)] = $definition;
        }
    }

    /**
     * @return TDefinition
     */
    public function resolve(string $key): Definition
    {
        if (! array_key_exists($key, $this->definitions)) {
            throw new UnknownLatticeComponent($this->name(), $key);
        }

        return $this->make($this->definitions[$key]);
    }

    public function endpointFor(string $key): string
    {
        $endpoint = (string) config(
            "lattice.{$this->group()}.endpoint",
            "lattice/{$this->group()}/{{$this->name()}}",
        );
        $path = str_replace('{'.$this->name().'}', rawurlencode($key), ltrim($endpoint, '/'));

        return '/'.$path;
    }

    /**
     * @param  class-string<TDefinition>  $definition
     */
    protected function registeredKeyFor(string $definition): string
    {
        $key = $this->keyFor($definition);

        if (($this->definitions[$key] ?? null) !== $definition) {
            throw new InvalidArgumentException("Lattice {$this->name()} [{$definition}] is not registered.");
        }

        return $key;
    }

    /**
     * @param  class-string<TDefinition>  $definition
     */
    protected function keyFor(string $definition): string
    {
        if (! is_subclass_of($definition, $this->definitionClass())) {
            throw new InvalidArgumentException("Lattice {$this->name()} [{$definition}] must extend [".$this->definitionClass().'].');
        }

        $attributeClass = $this->attributeClass();
        $attribute = Attributes::get($definition, $attributeClass);

        if (! $attribute instanceof $attributeClass) {
            throw new InvalidArgumentException("Lattice {$this->name()} [{$definition}] is missing the [".class_basename($attributeClass).'] attribute.');
        }

        return $attribute->key;
    }

    /**
     * @param  class-string<TDefinition>  $definition
     * @return TDefinition
     */
    protected function make(string $definition): Definition
    {
        return $this->container->make($definition);
    }

    /**
     * @return class-string<TDefinition>
     */
    abstract protected function definitionClass(): string;

    /**
     * @return class-string<ComponentAttribute>
     */
    abstract protected function attributeClass(): string;

    abstract protected function name(): string;

    abstract protected function group(): string;
}
