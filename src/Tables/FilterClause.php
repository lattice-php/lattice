<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class FilterClause
{
    public function __construct(
        public string $field,
        public Op $operator,
        public string $value,
    ) {}
}
