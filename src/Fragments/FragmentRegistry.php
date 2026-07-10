<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\Components\Component;
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
     * @param  array<string, mixed>  $context
     */
    public function lazyComponent(string $fragment, array $context = []): FragmentComponent
    {
        $key = $this->registeredKeyFor($fragment);
        $definition = $this->make($fragment)->withContext($context);

        if (! $this->authorizedToRender($definition)) {
            return FragmentComponent::make($key)->hidden();
        }

        $component = FragmentComponent::make($key)
            ->signedAs($key)
            ->context($context)
            ->endpoint($this->endpointFor($key));

        $component->lazy = true;

        return $component;
    }

    /**
     * @return array{schema: array<int, Component>}
     */
    public function response(string $key, ?FragmentDefinition $definition = null): array
    {
        $definition ??= $this->resolve($key);

        return [
            'schema' => $definition
                ->schema(PageSchema::make())
                ->renderable(),
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
