<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[Component('form.checkbox')]
class Checkbox extends Field
{
    use HasAutoFocus;
    use HasTabIndex;
}
