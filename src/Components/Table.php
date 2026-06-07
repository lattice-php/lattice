<?php

namespace Bambamboole\Lattice\Components;

class Table extends InteractiveComponent
{
    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    protected function type(): string
    {
        return 'table';
    }
}
