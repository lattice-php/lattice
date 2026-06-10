<?php

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Core\Components\Component;

final class PageSchema
{
    /**
     * @var array<int, Component>
     */
    private array $components = [];

    public static function make(): static
    {
        return new self;
    }

    /**
     * @param  array<int, Component>  $components
     */
    public function schema(array $components): static
    {
        $this->components = $components;

        return $this;
    }

    public function component(Component $component): static
    {
        $this->components[] = $component;

        return $this;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function toArray(): array
    {
        return array_map(
            fn (Component $component): array => $component->toArray(),
            array_values(array_filter(
                $this->components,
                fn (Component $component): bool => $component->shouldRender(),
            )),
        );
    }
}
