<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\Contracts\DefinitionRegistry as DefinitionRegistryContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;
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

    public function __construct(
        protected readonly Container $container,
        protected readonly DiscoveryManifest $manifest,
    ) {}

    protected function authorizedToRender(Definition $definition): bool
    {
        return $definition->authorize($this->container->make(Request::class));
    }

    /**
     * The gate every wire component build passes through: an unauthorized
     * definition yields a bare hidden component; an authorized one is
     * configured and then sealed. Registries supply only the construction
     * closures so this sequence cannot drift between them.
     *
     * @template TComponent of \Lattice\Lattice\Ui\Components\Component&Contracts\InteractiveComponent
     *
     * @param  class-string<TDefinition>  $definitionClass
     * @param  callable(string): TComponent  $component
     * @param  callable(TDefinition, TComponent, string): TComponent  $configure
     * @param  array<string, mixed>  $context
     * @return TComponent
     */
    protected function gatedComponent(string $definitionClass, callable $component, callable $configure, array $context = [])
    {
        $key = $this->registeredKeyFor($definitionClass);
        $definition = $this->make($definitionClass)->withContext($context);

        if (! $this->authorizedToRender($definition)) {
            return $component($key)->hidden();
        }

        return $configure($definition, $component($key), $key)
            ->signedAs($key)
            ->context($context);
    }

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
     * Imperative registration, layered over discovered definitions. Package
     * authors should prefer composer `extra.lattice.discover` over calling this.
     *
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
            throw new UnknownComponent($this->name(), $key);
        }

        return $this->make($definitions[$key]);
    }

    /**
     * Minted from the named route so the path honours the app's base path —
     * subdirectory installs included. Apps needing a different path
     * re-register the route under the same name.
     */
    public function endpointFor(string $key): string
    {
        return route($this->routeName(), [$this->name() => $key], absolute: false);
    }

    protected function routeName(): string
    {
        return "lattice.{$this->group()}.show";
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
     * @return class-string<DefinitionAttribute>
     */
    abstract public function attributeClass(): string;

    abstract protected function name(): string;

    abstract public function group(): string;
}
