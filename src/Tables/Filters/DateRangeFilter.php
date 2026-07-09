<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A from/until date-range filter. Each bound is optional; a present bound adds an
 * inclusive `whereDate` comparison against the column.
 */
#[AsFilter(FilterControl::DateRange)]
class DateRangeFilter extends Filter
{
    /**
     * @return array<int, DateInput>
     */
    #[\Override]
    public function schema(): array
    {
        return [
            DateInput::make('from', 'From')->rules(['date']),
            DateInput::make('until', 'Until')->rules(['date']),
        ];
    }

    /**
     * @return string|list<string|FilterIndicator|array{label?: string, value: mixed}>|array<string, mixed>|null
     */
    #[\Override]
    public function indicator(FormData $data): string|array|null
    {
        $from = $data->string('from');
        $until = $data->string('until');

        return trim($from.' - '.$until, ' -') ?: null;
    }

    public function apply(Builder $builder, FormData $data): void
    {
        $from = $data->get('from');
        $until = $data->get('until');

        if (is_string($from) && $from !== '') {
            $builder->whereDate($this->column(), '>=', $from);
        }

        if (is_string($until) && $until !== '') {
            $builder->whereDate($this->column(), '<=', $until);
        }
    }
}
