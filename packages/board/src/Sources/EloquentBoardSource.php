<?php
declare(strict_types=1);

namespace Lattice\Board\Sources;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Board\BoardColumn;
use Lattice\Board\BoardColumnCards;
use Lattice\Board\BoardQuery;
use Lattice\Board\BoardResult;
use Lattice\Board\Contracts\BoardSource;
use Lattice\Core\Enums\Op;
use Lattice\Table\Enums\FilterType;
use Lattice\Table\FilterApplier;

/**
 * @template TModel of Model
 *
 * The built-in Eloquent board source. One grouped count query supplies every
 * column's total, and each requested column is paged independently by its
 * position column, fetching one extra row to derive `hasMore` without a
 * second count.
 */
final readonly class EloquentBoardSource implements BoardSource
{
    /**
     * @param  class-string<TModel>  $model
     * @param  list<BoardColumn>  $columns
     * @param  list<string>  $searchable
     * @param  (Closure(Builder<TModel>): (Builder<TModel>|mixed))|null  $scope
     */
    public function __construct(
        private string $model,
        private array $columns,
        private string $columnField = 'status',
        private string $positionField = 'position',
        private array $searchable = [],
        private ?Closure $scope = null,
        private FilterApplier $filterApplier = new FilterApplier,
    ) {}

    public function query(BoardQuery $query): BoardResult
    {
        $columns = $this->resolveColumns($query->column);
        $totals = $this->totals($query);

        return BoardResult::make(array_map(
            fn (BoardColumn $column): BoardColumnCards => $this->columnCards($column, $query, $totals[$column->key()] ?? 0),
            $columns,
        ));
    }

    /**
     * @return list<BoardColumn>
     */
    private function resolveColumns(?string $key): array
    {
        if ($key === null) {
            return $this->columns;
        }

        return array_values(array_filter(
            $this->columns,
            static fn (BoardColumn $column): bool => $column->key() === $key,
        ));
    }

    /**
     * @return array<string, int>
     */
    private function totals(BoardQuery $query): array
    {
        $counts = $this->baseQuery($query)
            ->select($this->columnField)
            ->selectRaw('count(*) as aggregate')
            ->groupBy($this->columnField)
            ->pluck('aggregate', $this->columnField);

        $totals = [];

        foreach ($counts as $key => $count) {
            $totals[(string) $key] = (int) $count;
        }

        return $totals;
    }

    private function columnCards(BoardColumn $column, BoardQuery $query, int $total): BoardColumnCards
    {
        $builder = $this->baseQuery($query)->where($this->columnField, $column->key());

        $rows = $builder
            ->orderBy($this->positionField)
            ->orderBy($builder->getModel()->getKeyName())
            ->offset($query->offset)
            ->limit($query->limit + 1)
            ->get();

        $hasMore = $rows->count() > $query->limit;

        $cards = array_values($rows->take($query->limit)
            ->map($this->serializeCard(...))
            ->all());

        return new BoardColumnCards($column->key(), $cards, $total, $hasMore, $query->offset);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeCard(Model $row): array
    {
        return $row->toArray();
    }

    /**
     * @return Builder<TModel>
     */
    private function baseQuery(BoardQuery $query): Builder
    {
        /** @var Builder<TModel> $builder larastan drops the template when resolving newQuery() */
        $builder = (new $this->model)->newQuery();

        if ($this->scope instanceof Closure) {
            $scoped = ($this->scope)($builder);

            if ($scoped instanceof Builder) {
                $builder = $scoped;
            }
        }

        $this->applySearch($builder, $query);

        return $builder;
    }

    /**
     * @param  Builder<TModel>  $builder
     */
    private function applySearch(Builder $builder, BoardQuery $query): void
    {
        $term = $query->search;

        if ($term === '' || $this->searchable === []) {
            return;
        }

        $builder->where(function (Builder $group) use ($term): void {
            foreach ($this->searchable as $field) {
                $group->orWhere(fn (Builder $nested) => $this->filterApplier->apply(
                    Op::Contains,
                    $nested,
                    FilterType::Text,
                    $field,
                    $term,
                ));
            }
        });
    }
}
