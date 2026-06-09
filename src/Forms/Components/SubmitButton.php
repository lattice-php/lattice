<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Components\Component;
use Bambamboole\Lattice\Core\Concerns\HasVariant;

class SubmitButton extends Component
{
    use HasVariant;

    public static function make(string $label): static
    {
        return (new static)->prop('label', $label);
    }

    protected function type(): string
    {
        return 'form.submit-button';
    }
}
