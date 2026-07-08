<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasAffixes;
use Lattice\Lattice\Core\Concerns\HasIcon;
use Lattice\Lattice\Core\Concerns\HasTabIndex;
use Lattice\Lattice\Core\Concerns\Triggerable;

#[AsComponent('link')]
class Link extends Component
{
    use HasAffixes;
    use HasIcon;
    use HasTabIndex;
    use Triggerable;

    public static function make(string $label, ?string $key = null): static
    {
        $link = new static($key);
        $link->label = $label;

        return $link;
    }
}
