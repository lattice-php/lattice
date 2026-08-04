<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Tables\Enums\SortDirection;

#[TypeScript]
final readonly class TableSort
{
    public function __construct(public string $key, public SortDirection $direction) {}

    public static function fromString(string $sort): self
    {
        if (str_starts_with($sort, '-')) {
            return new self(substr($sort, 1), SortDirection::Desc);
        }

        return new self($sort, SortDirection::Asc);
    }
}
