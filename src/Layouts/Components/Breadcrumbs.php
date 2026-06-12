<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;

#[Attributes\Component('breadcrumbs')]
class Breadcrumbs extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
