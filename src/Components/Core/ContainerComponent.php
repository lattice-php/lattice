<?php

namespace Bambamboole\Lattice\Components\Core;

use Bambamboole\Lattice\Attributes\SerializationHook;

abstract class ContainerComponent extends Component
{
    /**
     * @var array<int, Component>
     */
    protected array $children = [];

    /**
     * @param  array<int, Component>  $children
     */
    public function children(array $children): static
    {
        $this->children = $children;

        return $this;
    }

    public function child(Component $child): static
    {
        $this->children[] = $child;

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
    protected function serialiseChildren(array $data): array
    {
        return [
            ...$data,
            'children' => array_map(
                fn (Component $child): array => $child->toArray(),
                $this->renderableChildren(),
            ),
        ];
    }
}
