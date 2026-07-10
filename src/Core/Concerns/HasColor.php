<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Enums\Color;

/**
 * Only the fluent setter is shared. Adopters keep their own `$color` property
 * declaration because its type/default genuinely differs per component (e.g.
 * Icon has no color by default and is nullable; Text defaults to Color::Muted
 * and is not nullable) — a trait property can't accommodate both.
 */
trait HasColor
{
    public function color(Color $color): static
    {
        $this->color = $color;

        return $this;
    }
}
