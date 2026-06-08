<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Core\Component;

class TextInput extends Component
{
    public static function make(string $name, string $label): static
    {
        return (new static)->props([
            'label' => $label,
            'name' => $name,
        ]);
    }

    public function email(): static
    {
        return $this->prop('type', 'email');
    }

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

    public function required(bool $required = true): static
    {
        return $this->prop('required', $required);
    }

    public function readOnly(bool $readOnly = true): static
    {
        return $this->prop('readOnly', $readOnly);
    }

    public function value(string $value): static
    {
        return $this->prop('value', $value);
    }

    public function autoFocus(bool $autoFocus = true): static
    {
        return $this->prop('autoFocus', $autoFocus);
    }

    public function autoComplete(string $autoComplete): static
    {
        return $this->prop('autoComplete', $autoComplete);
    }

    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }

    protected function type(): string
    {
        return 'form.text-input';
    }
}
