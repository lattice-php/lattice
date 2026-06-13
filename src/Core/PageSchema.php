<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;

final class PageSchema
{
    use FiltersRenderableComponents;

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
     * @return array<int, Component>
     */
    public function renderable(): array
    {
        return $this->renderableComponents($this->components);
    }
}
