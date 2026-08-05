<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Concerns\HasAffixes;
use Lattice\Ui\Concerns\HasIcon;
use Lattice\Ui\Concerns\HasTabIndex;
use Lattice\Ui\Concerns\Triggerable;

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
