<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

#[AsComponent('breadcrumbs')]
class Breadcrumbs extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
