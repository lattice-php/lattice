<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;

/**
 * Marks where the active page's content is rendered inside a layout schema.
 */
#[Attributes\Component('outlet')]
class Outlet extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
