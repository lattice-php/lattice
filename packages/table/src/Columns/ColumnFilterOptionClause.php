<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class ColumnFilterOptionClause
{
    public function __construct(
        public Op $operator,
        public string $value = '',
    ) {}
}
