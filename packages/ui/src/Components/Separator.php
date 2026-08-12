<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Enums\Orientation;

#[AsComponent('separator')]
class Separator extends Component
{
    public Orientation $orientation = Orientation::Horizontal;

    public bool $bleed = false;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function orientation(Orientation $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    /**
     * Extend the rule across the padding of a gutter-padded parent such as a
     * Card or Section, so it divides the panel edge to edge.
     */
    public function bleed(bool $bleed = true): static
    {
        $this->bleed = $bleed;

        return $this;
    }
}
