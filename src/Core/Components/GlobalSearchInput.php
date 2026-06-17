<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('global-search.input')]
class GlobalSearchInput extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
