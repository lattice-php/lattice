<?php

namespace Bambamboole\Lattice\Components\Form;

class Textarea extends Field
{
    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

    public function rows(int $rows): static
    {
        return $this->prop('rows', $rows);
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
        return 'form.textarea';
    }
}
