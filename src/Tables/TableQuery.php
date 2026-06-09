<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;
use Bambamboole\Lattice\Tables\Enums\Operator;
use Illuminate\Http\Request;

final readonly class TableQuery
{
    /**
     * @param  array<int, FilterClause>  $filters
     * @param  array<int, TableSort>  $sorts
     */
    private function __construct(
        private array $filters,
        private array $sorts,
        private int $page,
        private int $perPage,
    ) {}

    public static function empty(int $defaultPerPage = 25): self
    {
        return new self([], [], 1, max(1, min(100, $defaultPerPage)));
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public static function fromRequest(Request $request, array $columns, string $table, int $defaultPerPage = 25): self
    {
        $filters = self::parseFilters($request->input('filter'));
        $sorts = self::parseSorts($request->input('sort'));

        self::validateFilters($filters, $columns, $table);
        self::validateSorts($sorts, $columns, $table);

        return new self(
            $filters,
            $sorts,
            max(1, $request->integer('page', 1)),
            max(1, min(100, $request->integer('per_page', $defaultPerPage))),
        );
    }

    /**
     * @return array<int, FilterClause>
     */
    public function filters(): array
    {
        return $this->filters;
    }

    /**
     * @return array<int, TableSort>
     */
    public function sorts(): array
    {
        return $this->sorts;
    }

    public function page(): int
    {
        return $this->page;
    }

    public function perPage(): int
    {
        return $this->perPage;
    }

    /**
     * @return array{filters: array<int, array{field: string, operator: string, value: string}>, sorts: array<int, array{key: string, direction: string}>, page: int, perPage: int}
     */
    public function toArray(): array
    {
        return [
            'filters' => array_map(
                fn (FilterClause $clause): array => $clause->toArray(),
                $this->filters,
            ),
            'sorts' => array_map(
                fn (TableSort $sort): array => $sort->toArray(),
                $this->sorts,
            ),
            'page' => $this->page,
            'perPage' => $this->perPage,
        ];
    }

    /**
     * @return array<int, FilterClause>
     */
    private static function parseFilters(mixed $filter): array
    {
        if (! is_string($filter) || $filter === '') {
            return [];
        }

        return collect(explode(',', $filter))
            ->map(fn (string $clause): FilterClause => FilterClause::fromString($clause))
            ->filter(fn (FilterClause $clause): bool => $clause->isComplete())
            ->values()
            ->all();
    }

    /**
     * @return array<int, TableSort>
     */
    private static function parseSorts(mixed $sort): array
    {
        if (! is_string($sort) || $sort === '') {
            return [];
        }

        return collect(explode(',', $sort))
            ->filter(fn (string $value): bool => $value !== '')
            ->map(fn (string $value): TableSort => TableSort::fromString($value))
            ->values()
            ->all();
    }

    /**
     * @param  array<int, FilterClause>  $filters
     * @param  array<int, Column>  $columns
     */
    private static function validateFilters(array $filters, array $columns, string $table): void
    {
        $byKey = collect($columns)->keyBy(fn (Column $column): string => $column->key);

        foreach ($filters as $filter) {
            $column = $byKey->get($filter->field);

            if (! $column instanceof Column || ! $column->isFilterable()) {
                throw InvalidTableQuery::filter($filter->field, $table);
            }

            $operator = Operator::tryFrom($filter->operator);

            if ($operator === null || ! in_array($operator, $column->filterOperators(), true)) {
                throw InvalidTableQuery::operator($filter->operator, $filter->field, $table);
            }
        }
    }

    /**
     * @param  array<int, TableSort>  $sorts
     * @param  array<int, Column>  $columns
     */
    private static function validateSorts(array $sorts, array $columns, string $table): void
    {
        $allowed = collect($columns)
            ->filter(fn (Column $column): bool => $column->isSortable())
            ->mapWithKeys(fn (Column $column): array => [$column->key => true]);

        foreach ($sorts as $sort) {
            if (! $allowed->has($sort->key)) {
                throw InvalidTableQuery::sort($sort->key, $table);
            }
        }
    }
}
