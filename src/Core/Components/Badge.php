<?php

namespace Bambamboole\Lattice\Core\Components;

class Badge extends Component
{
    public static function make(string $label, ?string $key = null): static
    {
        return (new static($key))->prop('label', $label);
    }

    protected function type(): string
    {
        return 'badge';
    }
}
