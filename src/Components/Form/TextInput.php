<?php

namespace Bambamboole\Lattice\Components\Form;

class TextInput extends Field
{
    public function email(): static
    {
        return $this
            ->prop('type', 'email')
            ->rules(['email:rfc,filter']);
    }

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
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
