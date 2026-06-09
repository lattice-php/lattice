<?php

namespace Bambamboole\Lattice\Forms\Components;

class DateInput extends Field
{
    public function min(string $min): static
    {
        return $this->prop('min', $min);
    }

    public function max(string $max): static
    {
        return $this->prop('max', $max);
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
        return 'form.date-input';
    }
}
