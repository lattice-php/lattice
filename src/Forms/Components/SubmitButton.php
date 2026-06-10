<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\HasVariant;

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
