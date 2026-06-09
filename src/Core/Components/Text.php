<?php

namespace Bambamboole\Lattice\Core\Components;

use Bambamboole\Lattice\Core\Enums\Align;

class Text extends Component
{
    public static function make(string $text, ?string $key = null): static
    {
        return (new static($key))->prop('text', $text);
    }

    public function align(Align|string $align): static
    {
        return $this->prop('align', $align instanceof Align ? $align->value : $align);
    }

    protected function type(): string
    {
        return 'text';
    }
}
