<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[Component('form.choice')]
class Choice extends Field
{
    use HasAutoFocus;
    use HasOptions;
    use HasTabIndex;
}
