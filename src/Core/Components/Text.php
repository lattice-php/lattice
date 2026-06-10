<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Enums\Align;

class Text extends Component
{
    public static function make(string $text, ?string $key = null): static
    {
        return (new static($key))->prop('text', $text);
    }

    public function align(Align|string $align): static
    {
        return $this->prop('align', $this->enumValue($align));
    }

    protected function type(): string
    {
        return 'text';
    }
}
