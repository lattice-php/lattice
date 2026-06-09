<?php

namespace Bambamboole\Lattice\Core\Components;

class Button extends Component
{
    public static function make(string $label, ?string $key = null): static
    {
        return (new static($key))->prop('label', $label);
    }

    public function variant(string $variant): static
    {
        return $this->prop('variant', $variant);
    }

    public function href(string $href): static
    {
        return $this->prop('href', $href);
    }

    protected function type(): string
    {
        return 'button';
    }
}
