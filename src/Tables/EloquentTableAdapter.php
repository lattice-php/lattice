<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\PaginationType;

/**
 * The built-in Eloquent table source. Applies a TableQuery's filters and sorts
 * to a query builder and paginates the result.
 *
 * @template TModel of Model
 */
final readonly class EloquentTableAdapter implements TableSource
{
    /**
     * @param  Closure(TableQuery): Builder<TModel>  $builder  produces a fresh base query per request
     * @param  array<int, Column>  $columns
     */
    public function __construct(
        private Closure $builder,
        private array $columns,
        private PaginationType $pagination,
    ) {}

    public function query(TableQuery $query): TableResult
    {
        $builder = $this->applyQuery(($this->builder)($query), $query);

        if ($this->pagination === PaginationType::None) {
            return TableResult::fromItems($builder->get(), PaginationType::None);
        }

        if ($this->pagination === PaginationType::Infinite) {
            return TableResult::fromSimplePaginator($builder->simplePaginate(
                perPage: $query->perPage(),
                page: $query->page(),
            ));
        }

        if ($this->pagination === PaginationType::Simple) {
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
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection
    {
        return $this->applyQuery(($this->builder)($query), $query)->get();
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

        return ($this->builder)(TableQuery::empty())
            ->whereKey($keys)
            ->get();
    }

    /**
     * @param  Builder<TModel>  $builder
     * @return Builder<TModel>
     */
    private function applyQuery(Builder $builder, TableQuery $query): Builder
    {
        $columns = collect($this->columns)->keyBy(fn (Column $column): string => $column->key);

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
}
