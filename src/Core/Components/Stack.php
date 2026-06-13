<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Height;
use Lattice\Lattice\Core\Enums\Justify;
use Lattice\Lattice\Core\Enums\Width;

#[Attributes\Component('stack')]
class Stack extends ContainerComponent
{
    public ?Gap $gap = null;

    public ?Align $align = null;

    public ?Justify $justify = null;

    public ?Width $width = null;

    public ?Height $height = null;

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

    public function height(Height $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function justify(Justify $justify): static
    {
        $this->justify = $justify;

        return $this;
    }

    public function direction(string $direction): static
    {
        $this->direction = $direction;

        return $this;
    }
}
