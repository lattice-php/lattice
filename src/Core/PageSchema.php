<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;

final class PageSchema
{
    use FiltersRenderableComponents;

    /**
     * @var array<int, Component>
     */
    private array $components = [];

    public static function make(): self
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
