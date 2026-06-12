<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

final readonly class TextColumnProps implements ColumnProps
{
    /**
     * @param  array{format: string|null}|null  $date
     * @param  array{href: string|null, external: bool}|null  $link
     */
    public function __construct(
        public ?array $date = null,
        public bool $copyable = false,
        public ?array $link = null,
    ) {}
}
