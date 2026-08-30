<?php
declare(strict_types=1);

namespace Lattice\Table\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Form\FormData;

final class TableFilterApplier
{
    /**
     * Applies each declared table filter whose key is present in the parsed
     * `tf` query value, shared by the Eloquent table and board sources.
     *
     * @template TModel of Model
     *
     * @param  array<string, mixed>  $tableFilters
     * @param  array<int, Filter>  $filters
     * @param  Builder<TModel>  $builder
     */
    public static function apply(array $tableFilters, array $filters, Builder $builder): void
    {
        $indexed = collect($filters)->keyBy(fn (Filter $filter): string => $filter->key());

        foreach ($tableFilters as $key => $value) {
            $filter = $indexed->get($key);

            if ($filter instanceof Filter) {
                $filter->apply($builder, FormData::make((array) $value));
            }
        }
    }
}
