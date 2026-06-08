<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Components\Core\Fragment as FragmentComponent;
use Bambamboole\Lattice\PageSchema;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use ReflectionClass;

class FragmentRegistry
{
    /**
     * @var array<string, class-string<FragmentDefinition>>
     */
    private array $fragments = [];

    public function __construct(private readonly Container $container) {}

    /**
     * @param  class-string<FragmentDefinition>|array<int, class-string<FragmentDefinition>>  $fragments
     */
    public function register(string|array $fragments): void
    {
        foreach ((array) $fragments as $fragment) {
            $this->fragments[$this->keyFor($fragment)] = $fragment;
        }
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     */
    public function lazyComponent(string $fragment): FragmentComponent
    {
        $key = $this->registeredKeyFor($fragment);

        return FragmentComponent::make($key)
            ->endpoint($this->endpointFor($key))
            ->prop('lazy', true);
    }

    /**
     * @return array{components: array<int, array<string, mixed>>}
     */
    public function response(string $key, ?FragmentDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        return [
            'components' => $definition
                ->schema(PageSchema::make())
                ->toArray(),
        ];
    }

    public function resolve(string $key): FragmentDefinition
    {
        if (! array_key_exists($key, $this->fragments)) {
            throw new InvalidArgumentException("Lattice fragment [{$key}] is not registered.");
        }

        return $this->make($this->fragments[$key]);
    }

    public function endpointFor(string $key): string
    {
        $endpoint = (string) config('lattice.fragments.endpoint', 'lattice/fragments/{fragment}');
        $path = str_replace('{fragment}', rawurlencode($key), ltrim($endpoint, '/'));

        return '/'.$path;
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     */
    private function registeredKeyFor(string $fragment): string
    {
        $key = $this->keyFor($fragment);

        if (($this->fragments[$key] ?? null) !== $fragment) {
            throw new InvalidArgumentException("Lattice fragment [{$fragment}] is not registered.");
        }

        return $key;
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     */
    private function keyFor(string $fragment): string
    {
        if (! is_subclass_of($fragment, FragmentDefinition::class)) {
            throw new InvalidArgumentException("Lattice fragment [{$fragment}] must extend [".FragmentDefinition::class.'].');
        }

        $attribute = (new ReflectionClass($fragment))->getAttributes(Fragment::class)[0] ?? null;

        if ($attribute === null) {
            throw new InvalidArgumentException("Lattice fragment [{$fragment}] is missing the [Fragment] attribute.");
        }

        return $attribute->newInstance()->key;
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     */
    private function make(string $fragment): FragmentDefinition
    {
        return $this->container->make($fragment);
    }
}
