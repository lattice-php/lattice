<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Core\Component;

class HiddenInput extends Component
{
    public static function make(string $name, string $value): static
    {
        return (new static)->props([
            'name' => $name,
            'value' => $value,
        ]);
    }

    protected function type(): string
    {
        return 'form.hidden-input';
    }
}
