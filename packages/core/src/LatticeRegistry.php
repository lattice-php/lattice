<?php
declare(strict_types=1);

namespace Lattice\Core;

use BadMethodCallException;
use Closure;
use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use Lattice\Core\Attributes\WireType;
use Lattice\Core\Support\TypeScript\WireFamily;

final class LatticeRegistry
{
    /** @var array<string, WireFamily> */
    private array $wireFamilies = [];

    /** @var array<string, Closure> */
    private array $capabilities = [];

    public function __construct(private readonly Container $container) {}

    public function registerCapability(string $name, Closure $capability): void
    {
        if (isset($this->capabilities[$name])) {
            throw new InvalidArgumentException(sprintf('Lattice capability [%s] is already registered.', $name));
        }

        $this->capabilities[$name] = $capability;
    }

    /** @param list<mixed> $arguments */
    public function __call(string $name, array $arguments): mixed
    {
        if (! isset($this->capabilities[$name])) {
            throw new BadMethodCallException(sprintf('Lattice capability [%s] is not registered.', $name));
        }

        return ($this->capabilities[$name])(...$arguments);
    }

    /**
     * Register a package's lang directory under a namespace, visible to both
     * the translator and the i18next JSON route. Registered on the loader
     * directly because that route resolves only the translation loader, so the
     * deferred loadTranslationsFrom() callback would never fire for it.
     */
    public function translations(string $namespace, string $path): void
    {
        $this->container->make('translation.loader')->addNamespace($namespace, $path);
    }

    /**
     * @param  class-string<WireType>  $attribute
     * @param  class-string  $reference
     */
    public function wireFamily(
        string $category,
        string $attribute,
        string $reference,
        bool $marker = false,
    ): void {
        if (isset($this->wireFamilies[$category])) {
            throw new InvalidArgumentException(sprintf('Wire family [%s] is already registered.', $category));
        }

        $this->wireFamilies[$category] = new WireFamily($category, $attribute, $reference, $marker);
    }

    /** @return Collection<string, WireFamily> */
    public function wireFamilies(): Collection
    {
        return collect($this->wireFamilies);
    }

    public function wireCategoryFor(WireType $attribute): string
    {
        $families = $this->wireFamilies()->where('marker', true);

        foreach ($families as $family) {
            if ($attribute::class === $family->attribute) {
                return $family->category;
            }
        }

        foreach ($families as $family) {
            if (is_a($attribute, $family->attribute)) {
                return $family->category;
            }
        }

        throw new InvalidArgumentException(sprintf('No wire family is registered for [%s].', $attribute::class));
    }
}
