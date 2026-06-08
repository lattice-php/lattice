<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Fragments;

use Bambamboole\Lattice\Attributes\ComponentAttribute;
use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Components\Core\Fragment as FragmentComponent;
use Bambamboole\Lattice\DefinitionRegistry;
use Bambamboole\Lattice\PageSchema;

/**
 * @extends DefinitionRegistry<FragmentDefinition>
 */
class FragmentRegistry extends DefinitionRegistry
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
    protected function attributeClass(): string
    {
        return Fragment::class;
    }

    protected function name(): string
    {
        return 'fragment';
    }

    protected function group(): string
    {
        return 'fragments';
    }
}
