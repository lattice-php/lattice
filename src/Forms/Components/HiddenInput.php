<?php

namespace Bambamboole\Lattice\Forms\Components;

class HiddenInput extends Field
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
