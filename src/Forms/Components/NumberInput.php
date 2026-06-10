<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class NumberInput extends Field
{
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public function min(int|float $min): static
    {
        return $this->prop('min', $min);
    }

    public function max(int|float $max): static
    {
        return $this->prop('max', $max);
    }

    public function step(int|float $step): static
    {
        return $this->prop('step', $step);
    }

    public function slider(bool $slider = true): static
    {
        return $this->prop('slider', $slider);
    }

    protected function type(): string
    {
        return 'form.number-input';
    }
}
