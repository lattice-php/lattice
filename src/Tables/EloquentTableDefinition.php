<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

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
        $builder = $this->applyQuery($this->builder($query), $query);

        if ($this->paginationType() === PaginationType::None) {
            return TableResult::fromItems($builder->get(), PaginationType::None);
        }

        if ($this->paginationType() === PaginationType::Infinite) {
            return TableResult::fromSimplePaginator($builder->simplePaginate(
                perPage: $query->perPage(),
                page: $query->page(),
            ));
        }

        if ($this->paginationType() === PaginationType::Simple) {
            return TableResult::fromSimplePaginator(
                $builder->simplePaginate(
                    perPage: $query->perPage(),
                    page: $query->page(),
                ),
                PaginationType::Simple,
            );
        }

        return TableResult::fromPaginator(
            $builder->paginate(
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

        foreach ($query->filters() as $clause) {
            $column = $columns->get($clause->field);

            if ($column instanceof Column) {
                $this->applyFilterClause($builder, $column, $clause);
            }
        }

        foreach ($query->sorts() as $sort) {
            $builder->orderBy($sort->key, $sort->direction);
        }

        return $builder;
    }

    /**
     * @param  array<int, mixed>  $keys
     * @return Collection<int, mixed>
     */
    public function resolveSelection(array $keys): Collection
    {
        if ($keys === []) {
            return new Collection;
        }

        return $this->builder(TableQuery::empty($this->columns(), '', $this->perPage()))
            ->whereKey($keys)
            ->get();
    }

    /**
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection
    {
        return $this->applyQuery($this->builder($query), $query)->get();
    }

    /**
     * @param  Builder<TModel>  $builder
     */
    private function applyFilterClause(Builder $builder, Column $column, FilterClause $clause): void
    {
        $field = $clause->field;
        $value = $clause->value;
        $isDate = $column->filterControlType() === 'date';

        $compare = function (string $operator) use ($builder, $field, $value, $isDate): void {
            if ($isDate) {
                $builder->whereDate($field, $operator, $value);

                return;
            }

            $builder->where($field, $operator, $value);
        };

        match ($clause->operator) {
            'contains' => $builder->where($field, 'like', '%'.str_replace(['%', '_'], ['\\%', '\\_'], $value).'%'),
            'equals' => $this->applyEquals($builder, $column, $field, $value),
            'not_equals' => $compare('!='),
            'gt' => $compare('>'),
            'gte' => $compare('>='),
            'lt' => $compare('<'),
            'lte' => $compare('<='),
            'before' => $builder->whereDate($field, '<', $value),
            'after' => $builder->whereDate($field, '>', $value),
            default => null,
        };
    }

    /**
     * @param  Builder<TModel>  $builder
     */
    private function applyEquals(Builder $builder, Column $column, string $field, string $value): void
    {
        $type = $column->filterControlType();

        if ($type === 'date') {
            $builder->whereDate($field, '=', $value);

            return;
        }

        if ($type === 'boolean') {
            $boolean = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

            if ($boolean !== null) {
                $builder->where($field, $boolean);
            }

            return;
        }

        $builder->where($field, $value);
    }
}
