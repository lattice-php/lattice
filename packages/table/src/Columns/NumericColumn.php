<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Table\Columns\Concerns\IsFilterable;
use Lattice\Table\Columns\Concerns\IsSortable;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Sortable;
use Lattice\Table\Enums\ColumnAlign;
use Lattice\Table\Enums\FilterType;
use Lattice\Ui\Concerns\HasCopyable;

abstract class NumericColumn extends Column implements Filterable, Sortable
{
    use HasCopyable;
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
