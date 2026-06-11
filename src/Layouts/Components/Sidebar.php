<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

/**
 * A fixed-width navigation column rendered alongside the page content in a
 * layout schema.
 */
#[Attributes\Component('sidebar')]
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
     * @param  array<int, Component>  $components
     */
    public function items(array $components): static
    {
        return $this->schema($components);
    }
}
