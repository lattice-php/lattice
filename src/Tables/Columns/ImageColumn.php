<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[Attributes\Column(type: 'image', props: ImageColumnProps::class)]
class ImageColumn extends Column
{
    protected bool $circular = false;

    protected ?int $size = null;

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

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: ColumnType::Image,
            props: new ImageColumnProps(
                circular: $this->circular ? true : null,
                size: $this->size,
            ),
        );
    }
}
