<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\Filterable;
use Lattice\Lattice\Tables\Columns\Sortable;

#[TypeScript]
final readonly class TableQuery implements JsonSerializable
{
    /**
     * @param  array<int, FilterClause>  $filters
     * @param  array<int, TableSort>  $sorts
     */
    private function __construct(
        public array $filters,
        public array $sorts,
        public int $page,
        public int $perPage,
    ) {}

    public static function empty(int $defaultPerPage = 25): self
    {
        return new self([], [], 1, self::clampPerPage($defaultPerPage));
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public static function fromRequest(Request $request, array $columns, string $table, int $defaultPerPage = 25): self
    {
        $filters = self::parseFilters($request->input('filter'));
        $sorts = self::parseSorts($request->input('sort'));
        $index = Column::index($columns);

        self::validateFilters($filters, $index, $table);
        self::validateSorts($sorts, $index, $table);

        return new self(
            $filters,
            $sorts,
            max(1, $request->integer('page', 1)),
            self::clampPerPage($request->integer('per_page', $defaultPerPage)),
        );
    }

    private static function clampPerPage(int $perPage): int
    {
        return max(1, min(100, $perPage));
    }

    /**
     * @return array{filters: array<int, FilterClause>, sorts: array<int, TableSort>, page: int, perPage: int}
     */
    public function jsonSerialize(): array
    {
        return [
            'filters' => $this->filters,
            'sorts' => $this->sorts,
            'page' => $this->page,
            'perPage' => $this->perPage,
        ];
    }

    /**
     * @return array<int, FilterClause>
     */
    private static function parseFilters(mixed $filter): array
    {
        return self::parseList(
            $filter,
            fn (string $clause): FilterClause => FilterClause::fromString($clause),
            fn (FilterClause $clause): bool => $clause->isComplete(),
        );
    }

    /**
     * @return array<int, TableSort>
     */
    private static function parseSorts(mixed $sort): array
    {
        return self::parseList(
            $sort,
            fn (string $value): TableSort => TableSort::fromString($value),
            fn (TableSort $sort): bool => $sort->key !== '',
        );
    }

    /**
     * Splits a comma-separated request value into mapped, kept items.
     *
     * @template TItem
     *
     * @param  Closure(string): TItem  $map
     * @param  Closure(TItem): bool  $keep
     * @return array<int, TItem>
     */
    private static function parseList(mixed $raw, Closure $map, Closure $keep): array
    {
        if (! is_string($raw) || $raw === '') {
            return [];
        }

        return collect(explode(',', $raw))
            ->map($map)
            ->filter($keep)
            ->values()
            ->all();
    }

    /**
     * @param  array<int, FilterClause>  $filters
     * @param  Collection<string, Column>  $index
     */
    private static function validateFilters(array $filters, Collection $index, string $table): void
    {
        foreach ($filters as $filter) {
            $column = $index->get($filter->field);

            if (! $column instanceof Filterable || ! $column->isFilterable()) {
                throw InvalidTableQuery::filter($filter->field, $table);
            }

            $operator = Op::tryFrom($filter->operator);

            if ($operator === null || ! in_array($operator, $column->availableOperators(), true)) {
                throw InvalidTableQuery::operator($filter->operator, $filter->field, $table);
            }
        }
    }

    /**
     * @param  array<int, TableSort>  $sorts
     * @param  Collection<string, Column>  $index
     */
    private static function validateSorts(array $sorts, Collection $index, string $table): void
    {
        foreach ($sorts as $sort) {
            $column = $index->get($sort->key);

            if (! $column instanceof Sortable || ! $column->isSortable()) {
                throw InvalidTableQuery::sort($sort->key, $table);
            }
        }
    }
}
