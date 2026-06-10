<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Width;

class Stack extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function gap(Gap|string $gap): static
    {
        return $this->prop('gap', $this->enumValue($gap));
    }

    public function align(Align|string $align): static
    {
        return $this->prop('align', $this->enumValue($align));
    }

    public function width(Width|string $width): static
    {
        return $this->prop('width', $this->enumValue($width));
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
