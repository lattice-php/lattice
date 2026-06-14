<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;

/**
 * Marks where flashed and action-emitted callouts render inside a layout
 * schema — typically between the header bar and the Outlet.
 */
#[Attributes\Component('callouts')]
class Callouts extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
