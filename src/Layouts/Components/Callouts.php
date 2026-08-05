<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

/**
 * Marks where flashed and action-emitted callouts render inside a layout
 * schema — typically between the header bar and the Outlet.
 */
#[AsComponent('callouts')]
class Callouts extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
