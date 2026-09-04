<?php
declare(strict_types=1);

namespace Lattice\Core;

use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Lattice\Core\Attributes\DefinitionAttribute;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Core\Services\ContextResolutions;
use Lattice\Core\Services\ContextScope;
use Spatie\Attributes\Attributes;

/**
 * @template TDefinition of Definition
 */
abstract class DefinitionRegistry
{
    /**
     * @var array<string, class-string<TDefinition>>
     */
    protected array $definitions = [];

    public function __construct(
        protected readonly Container $container,
        protected readonly DiscoveryManifest $manifest,
    ) {}

    /**
     * The gate every wire component build passes through: an unauthorized
     * definition yields a bare hidden component; an authorized one is
     * configured and then sealed. Registries supply only the construction
     * closures so this sequence cannot drift between them.
     *
     * Whitelisted and registered context keys ({@see ContextScope}) cascade:
     * they merge beneath the explicit context — so the gate and the sealed
     * ref see the same merged array — and the configure step runs inside a
     * ContextScope frame, so children built within it inherit them too. Any
     * object value under a registered key is normalized to its scalar first,
     * so the gate, `withContext()`, and the sealed ref never see a model.
     *
     * @template TComponent of Contracts\CanBeHidden&Contracts\InteractiveComponent
     *
     * @param  class-string<TDefinition>  $definitionClass
     * @param  callable(string): TComponent  $component
     * @param  callable(TDefinition, TComponent, string): TComponent  $configure
     * @param  array<string, mixed>  $context
     * @return TComponent
     */
    protected function gatedComponent(string $definitionClass, callable $component, callable $configure, array $context = [])
    {
        $scope = $this->container->make(ContextScope::class);
        $context = $this->container->make(ContextResolutions::class)->normalize($context);
        $context = [...$scope->inheritable(), ...$context];

        $key = $this->registeredKeyFor($definitionClass);
        $definition = $this->make($definitionClass)->withContext($context);

        if (! Authorization::passes($definition, $this->container->make(Request::class))) {
            return $component($key)->hidden();
        }

        return $scope->wrap($context, fn () => $configure($definition, $component($key), $key))
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
