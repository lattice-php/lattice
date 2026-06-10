<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Support\Collection;
use Lattice\Lattice\Tables\Contracts\TableSource;

/**
 * A table source defined by closures, for tables that build their own result
 * (in-memory data, an API call, …) without a dedicated source class. The bulk
 * resolvers default to empty when a table has no bulk actions.
 */
final readonly class CallbackTableSource implements TableSource
{
    /**
     * @param  Closure(TableQuery): TableResult  $query
     * @param  (Closure(TableQuery): Collection<int, mixed>)|null  $matching
     * @param  (Closure(array<int, mixed>): Collection<int, mixed>)|null  $selection
     */
    public function __construct(
        private Closure $query,
        private ?Closure $matching = null,
        private ?Closure $selection = null,
    ) {}

    public function query(TableQuery $query): TableResult
    {
        return ($this->query)($query);
    }

    /**
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection
    {
        return $this->matching !== null ? ($this->matching)($query) : new Collection;
    }

    /**
     * @param  array<int, mixed>  $keys
     * @return Collection<int, mixed>
     */
    public function resolveSelection(array $keys): Collection
    {
        return $this->selection !== null ? ($this->selection)($keys) : new Collection;
    }
}
