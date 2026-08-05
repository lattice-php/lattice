<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Checkbox)]
class Checkbox extends Field
{
    use HasAutoFocus;
    use HasTabIndex;
}
