<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class FilterIndicator
{
    public function __construct(
        public string $filter,
        public string $label,
        public string $value,
    ) {}
}
