<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Concerns\HasOptions;

class Choice extends Field
{
    use HasOptions;

    protected function type(): string
    {
        return 'form.choice';
    }
}
