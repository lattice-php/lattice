<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use Lattice\Lattice\Attributes\ComponentAttribute;
use Lattice\Lattice\Core\Contracts\DefinitionRegistry as DefinitionRegistryContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Exceptions\UnknownLatticeComponent;
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

    private ?string $endpointTemplate = null;

    public function __construct(
        protected readonly Container $container,
        protected readonly DiscoveryManifest $manifest,
    ) {}

    /**
     * Explicit registrations layered over the discovered manifest entries.
     *
     * @return array<string, class-string<TDefinition>>
     */
    protected function definitions(): array
    {
        /** @var array<string, class-string<TDefinition>> $discovered */
        $discovered = $this->manifest->forGroup($this->group());

        return array_merge($discovered, $this->definitions);
    }

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
        $definitions = $this->definitions();

        if (! array_key_exists($key, $definitions)) {
            throw new UnknownLatticeComponent($this->name(), $key);
        }

        return $this->make($definitions[$key]);
    }

    public function endpointFor(string $key): string
    {
        $this->endpointTemplate ??= (string) config(
            "lattice.{$this->group()}.endpoint",
            "lattice/{$this->group()}/{{$this->name()}}",
        );
        $path = str_replace('{'.$this->name().'}', rawurlencode($key), ltrim($this->endpointTemplate, '/'));

        return '/'.$path;
    }

    /**
     * @param  class-string<TDefinition>  $definition
     */
    protected function registeredKeyFor(string $definition): string
    {
        $key = $this->keyFor($definition);

        if (($this->definitions()[$key] ?? null) !== $definition) {
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
    abstract public function attributeClass(): string;

    abstract protected function name(): string;

    abstract public function group(): string;
}
