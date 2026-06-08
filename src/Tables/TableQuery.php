<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;
use Illuminate\Http\Request;

final readonly class TableQuery
{
    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, TableSort>  $sorts
     */
    private function __construct(
        private array $filters,
        private array $sorts,
        private int $page,
        private int $perPage,
    ) {}

    /**
     * @param  array<int, Column>  $columns
     */
    public static function empty(array $columns, string $table, int $defaultPerPage = 25): self
    {
        return self::fromRequest(Request::create('/'), $columns, $table, $defaultPerPage);
    }

    /**
     * @param  array<int, Column>  $columns
     */
    public static function fromRequest(Request $request, array $columns, string $table, int $defaultPerPage = 25): self
    {
        $filters = self::parseFilters($request->query('filter', []));
        $sorts = self::parseSorts($request->query('sort'));

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
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return $this->filters;
    }

    public function filter(string $key, mixed $default = null): mixed
    {
        return $this->filters[$key] ?? $default;
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
     * @return array{filters: array<string, mixed>, sorts: array<int, array{key: string, direction: string}>, page: int, perPage: int}
     */
    public function toArray(): array
    {
        return [
            'filters' => $this->filters,
            'sorts' => array_map(
                fn (TableSort $sort): array => $sort->toArray(),
                $this->sorts,
            ),
            'page' => $this->page,
            'perPage' => $this->perPage,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function parseFilters(mixed $filters): array
    {
        if (! is_array($filters)) {
            return [];
        }

        return collect($filters)
            ->mapWithKeys(fn (mixed $value, string|int $key): array => [
                (string) $key => self::normalizeFilterValue($value),
            ])
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

    private static function normalizeFilterValue(mixed $value): mixed
    {
        if (! is_string($value) || ! str_contains($value, ',')) {
            return $value;
        }

        return array_values(array_filter(
            explode(',', $value),
            fn (string $part): bool => $part !== '',
        ));
    }

    /**
     * @param  array<string, mixed>  $filters
     * @param  array<int, Column>  $columns
     */
    private static function validateFilters(array $filters, array $columns, string $table): void
    {
        $allowed = collect($columns)
            ->filter(fn (Column $column): bool => $column->isFilterable())
            ->mapWithKeys(fn (Column $column): array => [$column->key => true]);

        foreach (array_keys($filters) as $filter) {
            if (! $allowed->has($filter)) {
                throw InvalidTableQuery::filter($filter, $table);
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
