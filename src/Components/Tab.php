<?php

namespace Bambamboole\Lattice\Components;

class Tab extends Component
{
    public static function make(string $value, string $label, ?string $key = null): static
    {
        return (new static($key))->props([
            'label' => $label,
            'value' => $value,
        ]);
    }

    protected function type(): string
    {
        return 'tab';
    }
}
