<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\HasVariant;

#[Attributes\Component('form.submit-button')]
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
}
