<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;
use Bambamboole\Lattice\Tables\Columns\Filterable;
use Bambamboole\Lattice\Tables\Enums\FilterOperator;
use Bambamboole\Lattice\Tables\Enums\PaginationType;
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

            if ($column instanceof Filterable) {
                FilterOperator::from($clause->operator)->apply(
                    $builder,
                    $column->controlType(),
                    $clause->field,
                    $clause->value,
                );
            }
        }

        foreach ($query->sorts() as $sort) {
            $builder->orderBy($sort->key, $sort->direction->value);
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

        return $this->builder(TableQuery::empty($this->perPage()))
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
}
