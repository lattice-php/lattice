<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasOptions;

class Choice extends Field
{
    use HasOptions;

    protected function type(): string
    {
        return 'form.choice';
    }
}
