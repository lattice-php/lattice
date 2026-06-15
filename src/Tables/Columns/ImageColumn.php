<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Image)]
class ImageColumn extends Column
{
    public bool $circular = false;

    public ?int $size = null;

    /**
     * Render the image as a circle — useful for avatars.
     */
    public function circular(bool $circular = true): static
    {
        $this->circular = $circular;

        return $this;
    }

    /**
     * The rendered image size in pixels (square).
     */
    public function size(int $size): static
    {
        $this->size = $size;

        return $this;
    }
}
