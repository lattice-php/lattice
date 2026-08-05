<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Concerns\HasMinMax;
use Lattice\Form\Components\Concerns\HasStep;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\Rules\TimeString;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasTabIndex;

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
