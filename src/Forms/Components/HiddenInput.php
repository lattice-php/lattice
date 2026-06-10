<?php

namespace Lattice\Lattice\Forms\Components;

class HiddenInput extends Field
{
    protected function type(): string
    {
        return 'form.hidden-input';
    }
}
