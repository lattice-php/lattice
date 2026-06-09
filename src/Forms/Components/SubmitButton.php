<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Components\Component;

class SubmitButton extends Component
{
    public static function make(string $label): static
    {
        return (new static)->prop('label', $label);
    }

    public function variant(string $variant): static
    {
        return $this->prop('variant', $variant);
    }

    protected function type(): string
    {
        return 'form.submit-button';
    }
}
