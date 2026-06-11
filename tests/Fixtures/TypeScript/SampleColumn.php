<?php

namespace Lattice\Lattice\Tests\Fixtures\TypeScript;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;

#[Component('column.rating')]
class SampleColumn extends Column
{
    public int $max = 5;

    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: 'column.rating',
            props: ['max' => $this->max],
        );
    }
}
