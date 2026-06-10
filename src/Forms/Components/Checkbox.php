<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasTabIndex;

class Checkbox extends Field
{
    use HasTabIndex;

    protected function type(): string
    {
        return 'form.checkbox';
    }
}
