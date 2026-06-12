<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;

abstract class ContainerComponent extends Component
{
    use HasChildSchema;

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
}
