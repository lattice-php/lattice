<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Contracts\Renderable;

trait FiltersRenderableComponents
{
    /**
     * @template T of Renderable
     *
     * @param  array<int, T>  $components
     * @return array<int, T>
     */
    protected function renderableComponents(array $components): array
    {
        return array_values(array_filter(
            $components,
            static fn (Renderable $component): bool => $component->shouldRender(),
        ));
    }
}
