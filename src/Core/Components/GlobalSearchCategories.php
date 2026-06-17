<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('global-search.categories')]
class GlobalSearchCategories extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }
}
