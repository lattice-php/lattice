<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tables\Enums\FilterType;

#[AsColumn(ColumnType::Boolean)]
class BooleanColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    public function filterType(): FilterType
    {
        return FilterType::Boolean;
    }
}
