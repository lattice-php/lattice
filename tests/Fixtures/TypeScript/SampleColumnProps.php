<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Tables\Columns\ColumnProps;

final readonly class SampleColumnProps implements ColumnProps
{
    public function __construct(public int $max = 5) {}
}
