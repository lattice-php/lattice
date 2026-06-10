<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\HasVariant;

class SubmitButton extends Component
{
    use HasVariant;

    public ?string $label = null;

    public static function make(string $label): static
    {
        $button = new static;
        $button->label = $label;

        return $button;
    }

    protected function type(): string
    {
        return 'form.submit-button';
    }
}
