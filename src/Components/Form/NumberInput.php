<?php

namespace Bambamboole\Lattice\Components\Form;

class NumberInput extends Field
{
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

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

    public function slider(bool $slider = true): static
    {
        return $this->prop('slider', $slider);
    }

    public function autoFocus(bool $autoFocus = true): static
    {
        return $this->prop('autoFocus', $autoFocus);
    }

    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }

    protected function type(): string
    {
        return 'form.number-input';
    }
}
