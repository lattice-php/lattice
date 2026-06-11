<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[Component('form.checkbox')]
class Checkbox extends Field
{
    use HasTabIndex;
}
