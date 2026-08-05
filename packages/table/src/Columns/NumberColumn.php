<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Enums\ColumnType;
use Lattice\Ui\Enums\NumberFormatUnit;

#[AsColumn(ColumnType::Number)]
final class NumberColumn extends NumericColumn
{
    public ?NumberFormatUnit $unit = null;

    public bool $compact = false;

    public function unit(NumberFormatUnit $unit): static
    {
        $this->unit = $unit;

        return $this;
    }

    public function compact(bool $compact = true): static
    {
        $this->compact = $compact;

        return $this;
    }
}
