<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Components\Component;

trait FiltersRenderableComponents
{
    /**
     * @param  array<int, Component>  $components
     * @return array<int, Component>
     */
    protected function renderableComponents(array $components): array
    {
        return array_values(array_filter(
            $components,
            fn (Component $component): bool => $component->shouldRender(),
        ));
    }
}
