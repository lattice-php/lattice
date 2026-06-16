<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[AsComponent('link')]
class Link extends Component
{
    use HasHttpMethod;
    use HasTabIndex;

    public string $label = '';

    public ?string $href = null;

    public static function make(string $label, ?string $key = null): static
    {
        $link = new static($key);
        $link->label = $label;

        return $link;
    }

    public function href(string $href): static
    {
        $this->href = $href;

        return $this;
    }
}
