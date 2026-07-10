<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components\Concerns;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;

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
