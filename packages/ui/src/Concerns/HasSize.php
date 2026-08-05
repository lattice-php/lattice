<?php
declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use Lattice\Ui\Enums\Size;

trait HasSize
{
    public Size $size = Size::Md;

    public function size(Size $size): static
    {
        $this->size = $size;

        return $this;
    }
}
