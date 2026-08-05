<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class ColumnFilterOptionClause
{
    public function __construct(
        public Op $operator,
        public string $value = '',
    ) {}
}
