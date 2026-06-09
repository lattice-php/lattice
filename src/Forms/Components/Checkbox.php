<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasTabIndex;

class Checkbox extends Field
{
    use HasTabIndex;

    protected function type(): string
    {
        return 'form.checkbox';
    }
}
