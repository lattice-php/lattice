<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Filters\BaseFilter;

/**
 * The built-in Eloquent table source. Applies a TableQuery's filters and sorts
 * to a query builder and paginates the result. Columns keyed by a dotted path
 * into a to-one relation (`businessPartner.name`) are resolved to a constrained
 * eager load, a `whereHas` filter, and a correlated-subquery sort.
 *
 * @template TModel of Model
 */
final readonly class EloquentTableSource implements TableSource
{
    /**
     * @param  Closure(TableQuery): Builder<TModel>  $builder  produces a fresh base query per request
     * @param  array<int, Column>  $columns
     * @param  array<int, BaseFilter>  $filters
     */
    public function __construct(
        private Closure $builder,
        private array $columns,
        private PaginationType $pagination,
        private array $filters = [],
        private FilterApplier $filterApplier = new FilterApplier,
    ) {}

    public function query(TableQuery $query): TableResult
    {
        $builder = ($this->builder)($query);
        $relations = $this->relationColumns($builder->getModel());

        $this->eagerLoadRelations($builder, $relations);
        $this->applyQuery($builder, $query, $relations);

        $project = $this->rowProjector($relations);

        return match ($this->pagination) {
            PaginationType::None => TableResult::fromItems(
                $builder->get()->map($project),
            ),
            PaginationType::Infinite, PaginationType::Simple => TableResult::fromSimplePaginator(
                $builder->simplePaginate(perPage: $query->perPage, page: $query->page)->through($project),
                $this->pagination,
            ),
            PaginationType::Table => TableResult::fromPaginator(
                $builder->paginate(perPage: $query->perPage, page: $query->page)->through($project),
            ),
        };
    }

    /**
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection
    {
        $builder = ($this->builder)($query);

        $this->applyQuery($builder, $query, $this->relationColumns($builder->getModel()));

        return $builder->get();
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
     * @param  array<string, RelationColumn>  $relations
     */
    private function applyQuery(Builder $builder, TableQuery $query, array $relations): void
    {
        $columns = Column::index($this->columns);

        foreach ($query->filters as $clause) {
            $column = $columns->get($clause->field);

            if (! $column instanceof Filterable) {
                continue;
            }

            $operator = Op::from($clause->operator);
            $relation = $relations[$clause->field] ?? null;

            if ($relation instanceof RelationColumn) {
                $relation->applyFilter($builder, fn (Builder $related) => $this->filterApplier->apply(
                    $operator,
                    $related,
                    $column->filterType(),
                    $relation->field,
                    $clause->value,
                ));

                continue;
            }

            $this->filterApplier->apply($operator, $builder, $column->filterType(), $clause->field, $clause->value);
        }

        $filters = collect($this->filters)->keyBy(fn (BaseFilter $filter): string => $filter->key);

        foreach ($query->tableFilters as $key => $value) {
            $filter = $filters->get($key);

            if ($filter instanceof BaseFilter) {
                $filter->apply($builder, $value);
            }
        }

        foreach ($query->sorts as $sort) {
            $relation = $relations[$sort->key] ?? null;

            if ($relation instanceof RelationColumn) {
                $relation->applySort($builder, $sort->direction->value);

                continue;
            }

            $builder->orderBy($sort->key, $sort->direction->value);
        }
    }

    /**
     * @return array<string, RelationColumn>
     */
    private function relationColumns(Model $model): array
    {
        $relations = [];

        foreach ($this->columns as $column) {
            $relation = RelationColumn::resolve($model, $column->key());

            if ($relation instanceof RelationColumn) {
                $relations[$column->key()] = $relation;
            }
        }

        return $relations;
    }

    /**
     * @param  Builder<TModel>  $builder
     * @param  array<string, RelationColumn>  $relations
     */
    private function eagerLoadRelations(Builder $builder, array $relations): void
    {
        if ($relations === []) {
            return;
        }

        /** @var array<string, list<string>> $columnsByRelation */
        $columnsByRelation = [];

        foreach ($relations as $relation) {
            $columnsByRelation[$relation->relation] = array_merge(
                $columnsByRelation[$relation->relation] ?? [],
                $relation->relatedColumns(),
            );

            $this->keepBaseColumn($builder, $relation->baseKey());
        }

        $eager = [];

        foreach ($columnsByRelation as $name => $columns) {
            $select = array_values(array_unique($columns));
            $eager[$name] = static fn (Relation $related): Relation => $related->select($select);
        }

        $builder->with($eager);
    }

    /**
     * Ensure an explicit base select() keeps the key the relation matches on; a
     * `SELECT *` already has it.
     *
     * @param  Builder<TModel>  $builder
     */
    private function keepBaseColumn(Builder $builder, string $column): void
    {
        $selected = $builder->getQuery()->columns;

        if ($selected === null) {
            return;
        }

        $table = $builder->getModel()->getTable();

        if (in_array('*', $selected, true) || in_array($table.'.*', $selected, true)) {
            return;
        }

        if (in_array($column, $selected, true) || in_array($table.'.'.$column, $selected, true)) {
            return;
        }

        $builder->addSelect($table.'.'.$column);
    }

    /**
     * A row mapper that flattens each relation column's value onto a flat key
     * (and hides the nested relation it loaded). Returns the model untouched when
     * there are no relation columns, so non-relation tables keep serializing
     * through TableResult exactly as before.
     *
     * @param  array<string, RelationColumn>  $relations
     * @return Closure(Model): (array<string, mixed>|Model)
     */
    private function rowProjector(array $relations): Closure
    {
        if ($relations === []) {
            return static fn (Model $model): Model => $model;
        }

        $relationNames = array_values(array_unique(array_map(
            static fn (RelationColumn $relation): string => $relation->relation,
            $relations,
        )));

        return function (Model $model) use ($relations, $relationNames): array {
            $row = $model->makeHidden($relationNames)->toArray();

            foreach ($relations as $relation) {
                $row[$relation->key] = $relation->value($model);
            }

            return $row;
        };
    }
}
