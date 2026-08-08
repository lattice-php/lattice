<?php
declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use Lattice\Ui\Contracts\Renderable;

trait FiltersRenderableComponents
{
    /**
     * @template T of Renderable
     *
     * @param  array<int, T>  $components
     * @return list<T>
     */
    protected function renderableComponents(array $components): array
    {
        return array_values(array_filter(
            $components,
            static fn (Renderable $component): bool => $component->shouldRender(),
        ));
    }
}
