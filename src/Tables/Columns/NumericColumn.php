<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnAlign;
use Lattice\Lattice\Tables\Enums\FilterType;

abstract class NumericColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    public ColumnAlign $align = ColumnAlign::End;

    public ?int $minimumFractionDigits = null;

    public ?int $maximumFractionDigits = null;

    public function decimals(int $min, ?int $max = null): static
    {
        $this->minimumFractionDigits = $min;
        $this->maximumFractionDigits = $max ?? $min;

        return $this;
    }

    #[\Override]
    public function filterType(): FilterType
    {
        return FilterType::Number;
    }
}
