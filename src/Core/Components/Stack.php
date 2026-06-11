<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Width;

class Stack extends ContainerComponent
{
    public ?Gap $gap = null;

    public ?Align $align = null;

    public ?Width $width = null;

    public ?string $direction = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function gap(Gap $gap): static
    {
        $this->gap = $gap;

        return $this;
    }

    public function align(Align $align): static
    {
        $this->align = $align;

        return $this;
    }

    public function width(Width $width): static
    {
        $this->width = $width;

        return $this;
    }

    public function direction(string $direction): static
    {
        $this->direction = $direction;

        return $this;
    }

    protected function type(): string
    {
        return 'stack';
    }
}
