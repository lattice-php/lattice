<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * @template TModel of Model
 */
abstract class EloquentTableDefinition extends TableDefinition
{
    /**
     * @return Builder<TModel>
     */
    abstract public function builder(TableQuery $query): Builder;

    public function query(TableQuery $query): TableResult
    {
        return TableResult::fromPaginator(
            $this->applyQuery($this->builder($query), $query)->paginate(
                perPage: $query->perPage(),
                page: $query->page(),
            ),
        );
    }

    /**
     * @param  Builder<TModel>  $builder
     * @return Builder<TModel>
     */
    protected function applyQuery(Builder $builder, TableQuery $query): Builder
    {
        $columns = collect($this->columns())->keyBy(fn (Column $column): string => $column->key);

        foreach ($query->filters() as $key => $value) {
            $column = $columns->get($key);

            if (! $column instanceof Column || $value === null || $value === '') {
                continue;
            }

            if ($column->filterType() === 'exact') {
                $this->applyExactFilter($builder, $key, $value);

                continue;
            }

            $builder->where($key, 'like', '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $value).'%');
        }

        foreach ($query->sorts() as $sort) {
            $builder->orderBy($sort->key, $sort->direction);
        }

        return $builder;
    }

    /**
     * @param  Builder<TModel>  $builder
     */
    private function applyExactFilter(Builder $builder, string $key, mixed $value): void
    {
        if (is_array($value)) {
            $builder->whereIn($key, $value);

            return;
        }

        $builder->where($key, $value);
    }
}
