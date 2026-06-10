<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Concerns\HasVariant;

class Button extends Component
{
    use HasVariant;

    public static function make(string $label, ?string $key = null): static
    {
        return (new static($key))->prop('label', $label);
    }

    public function href(string $href): static
    {
        return $this->prop('href', $href);
    }

    protected function type(): string
    {
        return 'button';
    }
}
