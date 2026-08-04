<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Enums\Orientation;

#[AsComponent('separator')]
class Separator extends Component
{
    public Orientation $orientation = Orientation::Horizontal;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function orientation(Orientation $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }
}
