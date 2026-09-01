<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Columns\Concerns\IsFilterable;
use Lattice\Table\Columns\Concerns\IsSortable;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Sortable;
use Lattice\Table\Enums\ColumnType;
use Lattice\Table\Enums\FilterType;
use Lattice\Ui\Enums\ColumnWidth;

#[AsColumn(ColumnType::Boolean)]
final class BooleanColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    public ColumnWidth $width = ColumnWidth::Xs;

    public function filterType(): FilterType
    {
        return FilterType::Boolean;
    }
}
