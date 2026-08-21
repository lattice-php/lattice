<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Contracts\SchemaEntry;

/**
 * A navigation menu composed of MenuItems, rendered inside a layout schema.
 */
#[AsComponent('menu')]
class Menu extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  array<int, SchemaEntry>  $items
     */
    public function items(array $items): static
    {
        return $this->schema($items);
    }
}
