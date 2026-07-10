<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasAffixes;
use Lattice\Lattice\Ui\Concerns\HasIcon;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;
use Lattice\Lattice\Ui\Concerns\Triggerable;

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
