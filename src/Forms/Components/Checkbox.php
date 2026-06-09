<?php

namespace Bambamboole\Lattice\Forms\Components;

class Checkbox extends Field
{
    public function required(bool $required = true): static
    {
        return $this->prop('required', $required);
    }

    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }

    protected function type(): string
    {
        return 'form.checkbox';
    }
}
