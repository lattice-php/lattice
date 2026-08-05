<?php
declare(strict_types=1);

namespace Lattice\Table;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class FilterClause
{
    public function __construct(
        public string $field,
        public Op $operator,
        public string $value,
    ) {}
}
