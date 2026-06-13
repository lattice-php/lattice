<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

final readonly class ImageColumnProps implements ColumnProps
{
    public function __construct(
        public bool $circular = false,
        public ?int $size = null,
    ) {}
}
