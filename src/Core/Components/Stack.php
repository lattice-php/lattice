<?php

namespace Bambamboole\Lattice\Core\Components;

use Bambamboole\Lattice\Core\Align;
use Bambamboole\Lattice\Core\Gap;
use Bambamboole\Lattice\Core\Width;

class Stack extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function gap(Gap|string $gap): static
    {
        return $this->prop('gap', $gap instanceof Gap ? $gap->value : $gap);
    }

    public function align(Align|string $align): static
    {
        return $this->prop('align', $align instanceof Align ? $align->value : $align);
    }

    public function width(Width|string $width): static
    {
        return $this->prop('width', $width instanceof Width ? $width->value : $width);
    }

    public function direction(string $direction): static
    {
        return $this->prop('direction', $direction);
    }

    protected function type(): string
    {
        return 'stack';
    }
}
