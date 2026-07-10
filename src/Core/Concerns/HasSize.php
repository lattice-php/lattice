<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Enums\Size;

trait HasSize
{
    public Size $size = Size::Md;

    public function size(Size $size): static
    {
        $this->size = $size;

        return $this;
    }
}
