<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

use Illuminate\Support\Collection;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

/**
 * Where a table's rows come from. Lattice ships an Eloquent source; implement
 * this for any other backing store (an array, a search index, an API).
 */
interface TableSource
{
    public function query(TableQuery $query): TableResult;

    /**
     * Every row matching the query, ignoring pagination — used by "select all
     * matching" bulk actions.
     *
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection;

    /**
     * The rows for an explicit set of selected keys — used by bulk actions.
     *
     * @param  array<int, mixed>  $keys
     * @return Collection<int, mixed>
     */
    public function resolveSelection(array $keys): Collection;
}
