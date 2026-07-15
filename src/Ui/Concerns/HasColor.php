<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorName;

trait HasColor
{
    public ?Color $color = null;

    public function color(Color|ColorName|string $color): static
    {
        $this->color = Color::from($color);

        return $this;
    }
}
