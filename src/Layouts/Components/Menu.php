<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

/**
 * A navigation menu composed of MenuItems, rendered inside a layout schema.
 */
class Menu extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  array<int, Component>  $items
     */
    public function items(array $items): static
    {
        return $this->schema($items);
    }

    protected function type(): string
    {
        return 'menu';
    }
}
