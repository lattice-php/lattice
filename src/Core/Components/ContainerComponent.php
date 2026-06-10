<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\SerializationHook;

abstract class ContainerComponent extends Component
{
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
        return array_values(array_filter(
            $this->children,
            fn (Component $child): bool => $child->shouldRender(),
        ));
    }

    /**
     * @return array<int, Component>
     */
    public function descendants(): array
    {
        $result = [];

        foreach ($this->children as $child) {
            $result[] = $child;

            if ($child instanceof ContainerComponent) {
                $result = [...$result, ...$child->descendants()];
            }
        }

        return $result;
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
