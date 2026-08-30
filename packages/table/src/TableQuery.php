<?php
declare(strict_types=1);

namespace Lattice\Table;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Enums\Op;
use Lattice\Core\Support\Wire;
use Lattice\Table\Columns\Column;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Sortable;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Filters\FilterIndicator;
use Lattice\Table\Filters\TableFilterParser;
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
        public string $search = '',
        public ?PaginationType $mode = null,
    ) {}

    public static function empty(int $defaultPerPage = 25): self
    {
        return new self([], [], 1, self::clampPerPage($defaultPerPage), [], [], '');
    }

    /**
     * @param  array<int, Column>  $columns
     * @param  array<int, Filter>  $filters
     * @param  array<int, int|PaginationType::Infinite>  $perPageOptions
     */
    public static function fromRequest(Request $request, array $columns, string $table, int $defaultPerPage = 25, array $filters = [], array $perPageOptions = [], bool $strict = true): self
    {
        $clauses = self::parseFilters($request->input('filter'), $table, $strict);
        $sorts = self::parseSorts($request->input('sort'));
        $index = Column::index($columns);

        $clauses = self::validateFilters($clauses, $index, $table, $strict);
        $sorts = self::validateSorts($sorts, $index, $table, $strict);

        [$tableFilters, $tableFilterIndicators] = TableFilterParser::parse($request->input('tf'), $filters, $table, $request, $strict);

        return new self(
            $clauses,
            $sorts,
            max(1, $request->integer('page', 1)),
            self::resolvePerPage($request->integer('per_page', $defaultPerPage), $defaultPerPage, $perPageOptions),
            $tableFilters,
            $tableFilterIndicators,
            $request->string('q')->trim()->toString(),
            self::resolveMode($request->input('mode'), $perPageOptions),
        );
    }

    private static function clampPerPage(int $perPage): int
    {
        return max(1, min(100, $perPage));
    }

    /**
     * Declared options are trusted verbatim; without options the request value
     * is clamped as before.
     *
     * @param  array<int, int|PaginationType::Infinite>  $options
     */
    private static function resolvePerPage(int $perPage, int $default, array $options): int
    {
        $numeric = array_filter($options, is_int(...));

        if ($numeric === []) {
            return self::clampPerPage($perPage);
        }

        return in_array($perPage, $numeric, true) ? $perPage : self::clampPerPage($default);
    }

    /**
     * A mode override is only honored when the declared options offer it:
     * 'infinite' requires the infinite option, 'table' any options at all.
     *
     * @param  array<int, int|PaginationType::Infinite>  $options
     */
    private static function resolveMode(mixed $mode, array $options): ?PaginationType
    {
        return match (true) {
            $mode === 'infinite' && in_array(PaginationType::Infinite, $options, true) => PaginationType::Infinite,
            $mode === 'table' && $options !== [] => PaginationType::Table,
            default => null,
        };
    }

    /**
     * @return array{filters: array<int, FilterClause>, sorts: array<int, TableSort>, page: int, perPage: int, tableFilters: array<string, mixed>|stdClass, tableFilterIndicators: list<FilterIndicator>, search: string, mode: PaginationType|null}
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
            'search' => $this->search,
            'mode' => $this->mode,
        ];
    }

    /**
     * @return array<int, FilterClause>
     */
    private static function parseFilters(mixed $filter, string $table, bool $strict): array
    {
        if (! is_string($filter) || $filter === '') {
            return [];
        }

        return array_values(array_filter(array_map(
            fn (string $clause): ?FilterClause => self::parseClause($clause, $table, $strict),
            explode(',', $filter),
        )));
    }

    /**
     * Parse a `field:operator:value` clause into a validated FilterClause: an
     * incomplete clause (blank field/operator, or a value-taking operator with no
     * value) is dropped; a non-empty operator that isn't a known Op is rejected in
     * strict mode, dropped otherwise.
     */
    private static function parseClause(string $clause, string $table, bool $strict): ?FilterClause
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
            if ($strict) {
                throw InvalidTableQuery::operator($rawOperator, $field, $table);
            }

            return null;
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
     * @return array<int, FilterClause>
     */
    private static function validateFilters(array $filters, Collection $index, string $table, bool $strict): array
    {
        $valid = [];

        foreach ($filters as $filter) {
            $column = $index->get($filter->field);

            if (! $column instanceof Filterable || ! $column->isFilterable()) {
                if ($strict) {
                    throw InvalidTableQuery::filter($filter->field, $table);
                }

                continue;
            }

            if (! in_array($filter->operator, $column->availableOperators(), true)) {
                if ($strict) {
                    throw InvalidTableQuery::operator($filter->operator->value, $filter->field, $table);
                }

                continue;
            }

            if ($filter->operator->requiresValue() && ! $column->filterType()->acceptsValue($filter->value)) {
                if ($strict) {
                    throw InvalidTableQuery::value($filter->value, $filter->field, $table);
                }

                continue;
            }

            $valid[] = $filter;
        }

        return $valid;
    }

    /**
     * @param  array<int, TableSort>  $sorts
     * @param  Collection<string, Column>  $index
     * @return array<int, TableSort>
     */
    private static function validateSorts(array $sorts, Collection $index, string $table, bool $strict): array
    {
        $valid = [];

        foreach ($sorts as $sort) {
            $column = $index->get($sort->key);

            if (! $column instanceof Sortable || ! $column->isSortable()) {
                if ($strict) {
                    throw InvalidTableQuery::sort($sort->key, $table);
                }

                continue;
            }

            $valid[] = $sort;
        }

        return $valid;
    }
}
