<?php

namespace Bambamboole\Lattice\Components\Forms;

use Bambamboole\Lattice\Components\Component;

class Checkbox extends Component
{
    public static function make(string $name, string $label): static
    {
        return (new static)->props([
            'label' => $label,
            'name' => $name,
        ]);
    }

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
