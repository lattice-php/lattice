<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Enums\NumberFormatUnit;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Number)]
class NumberColumn extends NumericColumn
{
    public ?NumberFormatUnit $unit = null;

    public function unit(NumberFormatUnit $unit): static
    {
        $this->unit = $unit;

        return $this;
    }
}
