<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Actions\Concerns\TriggersAction;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasTabIndex;
use Lattice\Lattice\Core\Concerns\Navigable;

#[AsComponent('link')]
class Link extends Component
{
    use HasTabIndex;
    use Navigable;
    use TriggersAction;

    public static function make(string $label, ?string $key = null): static
    {
        $link = new static($key);
        $link->label = $label;

        return $link;
    }
}
