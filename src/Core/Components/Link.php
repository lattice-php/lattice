<?php

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class Link extends Component
{
    use HasTabIndex;

    public static function make(string $label, ?string $key = null): static
    {
        return (new static($key))->prop('label', $label);
    }

    public function href(string $href): static
    {
        return $this->prop('href', $href);
    }

    public function method(BackedEnum|string $method): static
    {
        return $this->prop('method', $this->enumValue($method));
    }

    protected function type(): string
    {
        return 'link';
    }
}
