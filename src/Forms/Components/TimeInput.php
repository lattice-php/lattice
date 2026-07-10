<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\Rules\TimeString;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::TimeInput)]
class TimeInput extends Field
{
    use HasAutoFocus;
    use HasTabIndex;

    public ?string $min = null;

    public ?string $max = null;

    public ?int $step = null;

    public function min(string $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(string $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function step(int $step): static
    {
        $this->step = $step;

        return $this;
    }

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return [new TimeString];
    }
}
