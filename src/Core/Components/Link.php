<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Actions\Concerns\TriggersAction;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasAffixes;
use Lattice\Lattice\Core\Concerns\HasTabIndex;
use Lattice\Lattice\Core\Concerns\Navigable;

#[AsComponent('link')]
class Link extends Component
{
    use HasAffixes;
    use HasTabIndex;
    use Navigable;
    use TriggersAction;

    public ?string $icon = null;

    public static function make(string $label, ?string $key = null): static
    {
        $link = new static($key);
        $link->label = $label;

        return $link;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

        return $this;
    }
}
