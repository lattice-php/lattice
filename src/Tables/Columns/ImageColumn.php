<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Image)]
final class ImageColumn extends Column
{
    public bool $circular = false;

    public ?int $size = null;

    public bool $previewable = true;

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

    /**
     * Whether clicking the cell opens the image in a lightbox. On by default.
     */
    public function previewable(bool $previewable = true): static
    {
        $this->previewable = $previewable;

        return $this;
    }
}
