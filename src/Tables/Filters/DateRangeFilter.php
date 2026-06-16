<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A from/until date-range filter. Each bound is optional; a present bound adds an
 * inclusive `whereDate` comparison against the column.
 */
class DateRangeFilter extends BaseFilter
{
    public function toData(): FilterData
    {
        return new FilterData(
            $this->key,
            $this->label,
            FilterControl::DateRange,
            [],
        );
    }

    #[\Override]
    public function accepts(mixed $value): bool
    {
        return is_array($value);
    }

    public function apply(Builder $builder, mixed $value): void
    {
        if (! is_array($value)) {
            return;
        }

        $from = $value['from'] ?? null;
        $until = $value['until'] ?? null;

        if (is_string($from) && $from !== '') {
            $builder->whereDate($this->column(), '>=', $from);
        }

        if (is_string($until) && $until !== '') {
            $builder->whereDate($this->column(), '<=', $until);
        }
    }
}
