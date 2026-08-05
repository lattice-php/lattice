<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Concerns\HasMinMax;
use Lattice\Lattice\Forms\Components\Concerns\HasStep;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\Rules\TimeString;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::TimeInput)]
class TimeInput extends Field
{
    use HasAutoFocus;
    use HasMinMax;
    use HasStep;
    use HasTabIndex;

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return [new TimeString];
    }
}
