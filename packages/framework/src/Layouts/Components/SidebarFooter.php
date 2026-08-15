<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

/**
 * The bottom-pinned region of a sidebar. Built via {@see Sidebar::footer()}.
 */
#[AsComponent('sidebar.footer')]
class SidebarFooter extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
