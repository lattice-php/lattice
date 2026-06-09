<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasOptions;

class Choice extends Field
{
    use HasOptions;

    protected function type(): string
    {
        return 'form.choice';
    }
}
