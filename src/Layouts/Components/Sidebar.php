<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

/**
 * A fixed-width navigation column rendered alongside the page content in a
 * layout schema.
 */
#[AsComponent('sidebar')]
class Sidebar extends ContainerComponent
{
    public bool $collapsible = false;

    public bool $rememberState = true;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function collapsible(bool $collapsible = true, bool $rememberState = true): static
    {
        $this->collapsible = $collapsible;
        $this->rememberState = $rememberState;

        return $this;
    }

    /**
     * @param  array<int, SchemaEntry>  $components
     */
    public function items(array $components): static
    {
        return $this->schema($components);
    }
}
