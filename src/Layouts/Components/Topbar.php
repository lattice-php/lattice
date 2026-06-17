<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

/**
 * A horizontal application bar at the top of the page content. Give a child
 * stack `->float(Side::End)` to push it to the trailing edge.
 */
#[AsComponent('topbar')]
class Topbar extends ContainerComponent
{
    public bool $sticky = false;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function sticky(bool $sticky = true): static
    {
        $this->sticky = $sticky;

        return $this;
    }

    /**
     * @param  array<int, Component>  $components
     */
    public function items(array $components): static
    {
        return $this->schema($components);
    }
}
