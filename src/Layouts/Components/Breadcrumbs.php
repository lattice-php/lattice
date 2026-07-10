<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\Component;

#[AsComponent('breadcrumbs')]
class Breadcrumbs extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
