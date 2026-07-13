<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Contracts\Filterable;
use Lattice\Lattice\Tables\Contracts\Sortable;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\FilterIndicator;
use Lattice\Lattice\Tables\Filters\FilterValueValidator;
use stdClass;

#[TypeScript]
final readonly class TableQuery implements JsonSerializable
{
    /**
     * @param  array<int, FilterClause>  $filters
     * @param  array<int, TableSort>  $sorts
     * @param  array<string, array<string, mixed>>  $tableFilters
     * @param  list<FilterIndicator>  $tableFilterIndicators
     */
    private function __construct(
        public array $filters,
        public array $sorts,
        public int $page,
        public int $perPage,
        public array $tableFilters = [],
        public array $tableFilterIndicators = [],
    ) {}

    public static function empty(int $defaultPerPage = 25): self
    {
        return new self([], [], 1, self::clampPerPage($defaultPerPage), [], []);
    }

    /**
     * @param  array<int, Column>  $columns
     * @param  array<int, Filter>  $filters
     */
    public static function fromRequest(Request $request, array $columns, string $table, int $defaultPerPage = 25, array $filters = []): self
    {
        $clauses = self::parseFilters($request->input('filter'), $table);
        $sorts = self::parseSorts($request->input('sort'));
        $index = Column::index($columns);

        self::validateFilters($clauses, $index, $table);
        self::validateSorts($sorts, $index, $table);

        [$tableFilters, $tableFilterIndicators] = self::parseTableFilters($request->input('tf'), $filters, $table, $request);

        return new self(
            $clauses,
            $sorts,
            max(1, $request->integer('page', 1)),
            self::clampPerPage($request->integer('per_page', $defaultPerPage)),
            $tableFilters,
            $tableFilterIndicators,
        );
    }

    private static function clampPerPage(int $perPage): int
    {
        return max(1, min(100, $perPage));
    }

    /**
     * @return array{filters: array<int, FilterClause>, sorts: array<int, TableSort>, page: int, perPage: int, tableFilters: array<string, mixed>|stdClass, tableFilterIndicators: list<FilterIndicator>}
     */
    public function jsonSerialize(): array
    {
        return [
            'filters' => $this->filters,
            'sorts' => $this->sorts,
            'page' => $this->page,
            'perPage' => $this->perPage,
            'tableFilters' => Wire::map($this->tableFilters),
            'tableFilterIndicators' => $this->tableFilterIndicators,
        ];
    }

    /**
     * Parse and validate the `tf` request param against the table's declared
     * filters, keeping only values that satisfy the filter schema.
     *
     * @param  array<int, Filter>  $filters
     * @return array{0: array<string, array<string, mixed>>, 1: list<FilterIndicator>}
     */
    private static function parseTableFilters(mixed $tableFilters, array $filters, string $table, Request $request): array
    {
        if (! is_array($tableFilters) || $tableFilters === []) {
            return [[], []];
        }

        $index = collect($filters)->keyBy(fn (Filter $filter): string => $filter->key());
        $parsed = [];
        $indicators = [];
        $validator = app(FilterValueValidator::class);

        foreach ($tableFilters as $key => $value) {
            $filter = $index->get($key);

            if (! $filter instanceof Filter) {
                throw InvalidTableQuery::filter((string) $key, $table);
            }

            $data = $validator->validate($filter, $value, $request);

            if ($data !== null) {
                $parsed[$key] = $data->all();
                array_push($indicators, ...$filter->indicators($data));
            }
        }

        return [$parsed, $indicators];
    }

    /**
     * @return array<int, FilterClause>
     */
    private static function parseFilters(mixed $filter, string $table): array
    {
        return self::parseList(
            $filter,
            fn (string $clause): ?FilterClause => self::parseClause($clause, $table),
            fn (?FilterClause $clause): bool => $clause instanceof FilterClause,
        );
    }

    /**
     * Parse a `field:operator:value` clause into a validated FilterClause: an
     * incomplete clause (blank field/operator, or a value-taking operator with no
     * value) is dropped; a non-empty operator that isn't a known Op is rejected.
     */
    private static function parseClause(string $clause, string $table): ?FilterClause
    {
        $parts = explode(':', $clause, 3);
        $field = $parts[0];
        $rawOperator = $parts[1] ?? '';
        $value = isset($parts[2]) ? rawurldecode($parts[2]) : '';

        if ($field === '' || $rawOperator === '') {
            return null;
        }

        $operator = Op::tryFrom($rawOperator);

        if ($operator === null) {
            throw InvalidTableQuery::operator($rawOperator, $field, $table);
        }

        if ($operator->requiresValue() && $value === '') {
            return null;
        }

        return new FilterClause($field, $operator, $value);
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

            if (! in_array($filter->operator, $column->availableOperators(), true)) {
                throw InvalidTableQuery::operator($filter->operator->value, $filter->field, $table);
            }

            if ($filter->operator->requiresValue() && ! $column->filterType()->acceptsValue($filter->value)) {
                throw InvalidTableQuery::value($filter->value, $filter->field, $table);
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
