<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Height;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\Enums\Width;

#[AsComponent('stack')]
class Stack extends ContainerComponent
{
    public ?Gap $gap = null;

    public ?Align $align = null;

    public ?Justify $justify = null;

    public ?Width $width = null;

    public ?Height $height = null;

    public ?Orientation $direction = null;

    public ?Side $float = null;

    public bool $sticky = false;

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

    public function direction(Orientation $direction): static
    {
        $this->direction = $direction;

        return $this;
    }

    /**
     * Pin the stack below the sticky chrome above it while the page scrolls.
     * The stack publishes its own height as the sticky offset for its
     * siblings, so sticky content further down (a vertical tab rail, another
     * sticky stack) stacks beneath it instead of sliding underneath.
     */
    public function sticky(bool $sticky = true): static
    {
        $this->sticky = $sticky;

        return $this;
    }
}
