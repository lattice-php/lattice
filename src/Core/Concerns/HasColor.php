<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Enums\Color;

trait HasColor
{
    public ?Color $color = null;

    public function color(Color $color): static
    {
        $this->color = $color;

        return $this;
    }
}
