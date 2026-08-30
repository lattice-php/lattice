<?php
declare(strict_types=1);

namespace Lattice\Table\Filters;

use Illuminate\Http\Request;
use Lattice\Table\InvalidTableQuery;

final class TableFilterParser
{
    /**
     * Parse and validate a `tf` request param against a set of declared
     * filters, keeping only values that satisfy the filter schema.
     *
     * @param  array<int, Filter>  $filters
     * @return array{0: array<string, array<string, mixed>>, 1: list<FilterIndicator>}
     */
    public static function parse(mixed $tableFilters, array $filters, string $context, Request $request, bool $strict = true): array
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
                if ($strict) {
                    throw InvalidTableQuery::filter((string) $key, $context);
                }

                continue;
            }

            $data = $validator->validate($filter, $value, $request);

            if ($data !== null) {
                $parsed[$key] = $data->all();
                array_push($indicators, ...$filter->indicators($data));
            }
        }

        return [$parsed, $indicators];
    }
}
