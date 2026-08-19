<?php
declare(strict_types=1);

namespace Lattice\Table\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Form\Components\DateInput;
use Lattice\Form\FormData;
use Lattice\Table\Attributes\AsFilter;
use Lattice\Table\Enums\FilterControl;

/**
 * A from/until date-range filter. Each bound is optional; a present bound adds an
 * inclusive `whereDate` comparison against the column.
 */
#[AsFilter(FilterControl::DateRange)]
final class DateRangeFilter extends Filter
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

    #[\Override]
    public function indicator(FormData $data): ?string
    {
        $from = $data->string('from')->toString();
        $until = $data->string('until')->toString();

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
