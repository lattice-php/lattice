<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasOptions;

#[Component('form.choice')]
class Choice extends Field
{
    use HasOptions;
}
