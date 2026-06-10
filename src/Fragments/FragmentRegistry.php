<?php

declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Attributes\ComponentAttribute;
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;

/**
 * @extends DefinitionRegistry<FragmentDefinition>
 */
final class FragmentRegistry extends DefinitionRegistry
{
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
     * @return array{schema: array<int, array<string, mixed>>}
     */
    public function response(string $key, ?FragmentDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        return [
            'schema' => $definition
                ->schema(PageSchema::make())
                ->toArray(),
        ];
    }

    /**
     * @return class-string<FragmentDefinition>
     */
    protected function definitionClass(): string
    {
        return FragmentDefinition::class;
    }

    /**
     * @return class-string<ComponentAttribute>
     */
    public function attributeClass(): string
    {
        return Fragment::class;
    }

    protected function name(): string
    {
        return 'fragment';
    }

    public function group(): string
    {
        return 'fragments';
    }
}
