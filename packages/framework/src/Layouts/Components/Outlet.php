<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

/**
 * Marks where the active page's content is rendered inside a layout schema.
 */
#[AsComponent('outlet')]
class Outlet extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
