<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Components\Concerns\HasOptions;

class Choice extends Field
{
    use HasOptions;

    protected function type(): string
    {
        return 'form.choice';
    }
}
