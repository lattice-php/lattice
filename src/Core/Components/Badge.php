<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('badge')]
class Badge extends Component
{
    public string $label = '';

    public static function make(string $label, ?string $key = null): static
    {
        $badge = new static($key);
        $badge->label = $label;

        return $badge;
    }
}
