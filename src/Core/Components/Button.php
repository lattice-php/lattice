<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Concerns\HasVariant;

#[Attributes\Component('button')]
class Button extends Component
{
    use HasVariant;

    public string $label = '';

    public ?string $href = null;

    public static function make(string $label, ?string $key = null): static
    {
        $button = new static($key);
        $button->label = $label;

        return $button;
    }

    public function href(string $href): static
    {
        $this->href = $href;

        return $this;
    }
}
