<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Enums\Align;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\Height;
use Lattice\Lattice\Ui\Enums\Justify;
use Lattice\Lattice\Ui\Enums\Side;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Lattice\Lattice\Ui\Enums\Width;

#[AsComponent('stack')]
class Stack extends ContainerComponent
{
    public ?Gap $gap = null;

    public ?Align $align = null;

    public ?Justify $justify = null;

    public ?Width $width = null;

    public ?Height $height = null;

    public ?StackDirection $direction = null;

    public ?Side $float = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function float(Side $float): static
    {
        $this->float = $float;

        return $this;
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

    public function direction(StackDirection $direction): static
    {
        $this->direction = $direction;

        return $this;
    }
}
