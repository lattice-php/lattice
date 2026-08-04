<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAffixes;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::NumberInput)]
class NumberInput extends Field
{
    use HasAffixes;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public int|float|null $min = null;

    public int|float|null $max = null;

    public int|float|null $step = null;

    public bool $slider = false;

    public function min(int|float $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(int|float $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function step(int|float $step): static
    {
        $this->step = $step;

        return $this;
    }

    public function slider(bool $slider = true): static
    {
        $this->slider = $slider;

        return $this;
    }
}
