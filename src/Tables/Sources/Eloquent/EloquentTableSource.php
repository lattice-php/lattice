<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Sources\Eloquent;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Contracts\Filterable;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\FilterApplier;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\RelationBinding;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

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
     * @param  array<int, Filter>  $filters
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
        $relations = $this->relationProjections($builder->getModel());

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

        $this->applyQuery($builder, $query, $this->relationProjections($builder->getModel()));

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
     * @param  array<string, RelationProjection>  $relations
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

            if ($relation instanceof RelationProjection) {
                $relation->applyFilter($builder, fn (Builder $related) => $this->filterApplier->apply(
                    $operator,
                    $related,
                    $column->filterType(),
                    $relation->field(),
                    $clause->value,
                ));

                continue;
            }

            $this->filterApplier->apply($operator, $builder, $column->filterType(), $clause->field, $clause->value);
        }

        $filters = collect($this->filters)->keyBy(fn (Filter $filter): string => $filter->key());

        foreach ($query->tableFilters as $key => $value) {
            $filter = $filters->get($key);

            if ($filter instanceof Filter) {
                $filter->apply($builder, FormData::make((array) $value));
            }
        }

        foreach ($query->sorts as $sort) {
            $relation = $relations[$sort->key] ?? null;

            if ($relation instanceof RelationProjection) {
                $relation->applySort($builder, $sort->direction->value);

                continue;
            }

            $builder->orderBy($sort->key, $sort->direction->value);
        }
    }

    /**
     * Resolve every column that binds to a relation into the Eloquent machinery
     * that loads, filters, and sorts it. Columns stay driver-agnostic — they only
     * carry declarative data (a dotted key, a `multiple()` field); the source
     * reads that and decides how Eloquent fulfils it.
     *
     * @return array<string, RelationProjection>
     */
    private function relationProjections(Model $model): array
    {
        $projections = [];

        foreach ($this->columns as $column) {
            $binding = $this->relationBinding($column);

            if (! $binding instanceof RelationBinding) {
                continue;
            }

            $projection = $binding->many
                ? MultipleRelationColumn::resolve($model, $binding)
                : RelationColumn::resolve($model, $binding);

            if ($projection instanceof RelationProjection) {
                $projections[$column->key()] = $projection;
            }
        }

        return $projections;
    }

    /**
     * The relation a column draws its value from, as a driver-agnostic binding,
     * or null when the column reads a plain attribute.
     */
    private function relationBinding(Column $column): ?RelationBinding
    {
        if ($column instanceof TextColumn && $column->multiple !== null) {
            return new RelationBinding($column->key(), $column->multiple, many: true, colorField: $column->badge['colorKey'] ?? null);
        }

        if (! str_contains($column->key(), '.')) {
            return null;
        }

        [$relation, $field] = explode('.', $column->key(), 2);

        if ($field === '' || str_contains($field, '.')) {
            return null;
        }

        return new RelationBinding($relation, $field, many: false);
    }

    /**
     * @param  Builder<TModel>  $builder
     * @param  array<string, RelationProjection>  $relations
     */
    private function eagerLoadRelations(Builder $builder, array $relations): void
    {
        if ($relations === []) {
            return;
        }

        /** @var array<string, list<string>> $columnsByRelation */
        $columnsByRelation = [];

        foreach ($relations as $relation) {
            $columnsByRelation[$relation->relation()] = array_merge(
                $columnsByRelation[$relation->relation()] ?? [],
                $relation->eagerColumns(),
            );

            $this->keepBaseColumn($builder, $relation->baseKey());
        }

        $eager = [];

        foreach ($columnsByRelation as $name => $columns) {
            $select = array_values(array_unique($columns));
            $eager[$name] = static fn (Relation $related): Relation => $select === [] ? $related : $related->select($select);
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
     * @param  array<string, RelationProjection>  $relations
     * @return Closure(Model): (array<string, mixed>|Model)
     */
    private function rowProjector(array $relations): Closure
    {
        if ($relations === []) {
            return static fn (Model $model): Model => $model;
        }

        $relationNames = array_values(array_unique(array_map(
            static fn (RelationProjection $relation): string => $relation->relation(),
            $relations,
        )));

        return function (Model $model) use ($relations, $relationNames): array {
            $row = $model->makeHidden($relationNames)->toArray();

            foreach ($relations as $relation) {
                $row[$relation->key()] = $relation->project($model);
            }

            return $row;
        };
    }
}
