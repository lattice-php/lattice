<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;

#[AsColumn(type: 'column.rating', props: SampleColumnProps::class)]
class SampleColumn extends Column
{
    public int $max = 5;

    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: $this->resolvedType(),
            width: $this->resolvedWidth(),
            props: new SampleColumnProps($this->max),
        );
    }
}
