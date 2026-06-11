<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;

/**
 * The built-in Eloquent table source. Applies a TableQuery's filters and sorts
 * to a query builder and paginates the result.
 *
 * @template TModel of Model
 */
final readonly class EloquentTableSource implements TableSource
{
    /**
     * @param  Closure(TableQuery): Builder<TModel>  $builder  produces a fresh base query per request
     * @param  array<int, Column>  $columns
     */
    public function __construct(
        private Closure $builder,
        private array $columns,
        private PaginationType $pagination,
        private FilterApplier $filterApplier = new FilterApplier,
    ) {}

    public function query(TableQuery $query): TableResult
    {
        $builder = $this->applyQuery(($this->builder)($query), $query);

        return match ($this->pagination) {
            PaginationType::None => TableResult::fromItems($builder->get(), PaginationType::None),
            PaginationType::Infinite, PaginationType::Simple => TableResult::fromSimplePaginator(
                $builder->simplePaginate(perPage: $query->perPage(), page: $query->page()),
                $this->pagination,
            ),
            PaginationType::Table => TableResult::fromPaginator(
                $builder->paginate(perPage: $query->perPage(), page: $query->page()),
            ),
        };
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
        $columns = Column::index($this->columns);

        foreach ($query->filters() as $clause) {
            $column = $columns->get($clause->field);

            if ($column instanceof Filterable) {
                $this->filterApplier->apply(
                    Op::from($clause->operator),
                    $builder,
                    $column->filterType(),
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
