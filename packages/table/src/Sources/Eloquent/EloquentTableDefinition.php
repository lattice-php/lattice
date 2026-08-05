<?php
declare(strict_types=1);

namespace Lattice\Table\Sources\Eloquent;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;

/**
 * @template TModel of Model
 */
abstract class EloquentTableDefinition extends TableDefinition
{
    /**
     * @return Builder<TModel>
     */
    abstract public function builder(TableQuery $query): Builder;

    public function source(): TableSource
    {
        return new EloquentTableSource(
            fn (TableQuery $query): Builder => $this->builder($query),
            $this->columns(),
            $this->paginationType(),
            $this->filters(),
        );
    }
}
