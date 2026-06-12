<?php

namespace Lattice\Lattice\Core\Components\Concerns;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;

trait HasChildSchema
{
    use FiltersRenderableComponents;

    /**
     * @var array<int, Component>
     */
    protected array $children = [];

    /**
     * @param  array<int, Component>  $components
     */
    public function schema(array $components): static
    {
        $this->children = $components;

        return $this;
    }

    /**
     * @return array<int, Component>
     */
    protected function renderableChildren(): array
    {
        return $this->renderableComponents($this->children);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseSchema(array $data): array
    {
        return [
            ...$data,
            'schema' => $this->renderableChildren(),
        ];
    }
}
