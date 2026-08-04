<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Core\Contracts\ContainerComponent as ContainerComponentContract;
use Lattice\Lattice\Ui\Components\Concerns\HasChildSchema;

abstract class ContainerComponent extends Component implements ContainerComponentContract
{
    use HasChildSchema;

    /**
     * @return array<int, Component>
     */
    public function descendants(): array
    {
        $result = [];

        foreach ($this->resolvedChildren() as $child) {
            $result[] = $child;

            if ($child instanceof ContainerComponent) {
                $result = [...$result, ...$child->descendants()];
            }
        }

        return $result;
    }
}
