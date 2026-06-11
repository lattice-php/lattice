<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

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

    protected function type(): string
    {
        return 'link';
    }
}
