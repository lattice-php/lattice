<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Lattice\Ui\PageSchema;

/**
 * @extends DefinitionRegistry<FragmentDefinition>
 */
final class FragmentRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<FragmentDefinition>  $fragment
     * @param  array<string, mixed>  $context
     */
    public function lazyComponent(string $fragment, array $context = []): FragmentComponent
    {
        return $this->gatedComponent(
            $fragment,
            fn (string $key): FragmentComponent => FragmentComponent::make($key),
            function (FragmentDefinition $definition, FragmentComponent $component, string $key): FragmentComponent {
                $component->endpoint($this->endpointFor($key));
                $component->lazy = true;

                return $component;
            },
            $context,
        );
    }

    public function response(string $key, ?FragmentDefinition $definition = null): FragmentResponse
    {
        $definition ??= $this->resolve($key);

        return new FragmentResponse(
            $definition->schema(PageSchema::make())->renderable(),
        );
    }

    /**
     * @return class-string<FragmentDefinition>
     */
    protected function definitionClass(): string
    {
        return FragmentDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsFragment::class;
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
