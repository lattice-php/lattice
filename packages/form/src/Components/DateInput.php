<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Concerns\HasMinMax;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::DateInput)]
class DateInput extends Field
{
    use HasAutoFocus;
    use HasMinMax;
    use HasTabIndex;
}
