<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Tables\Contracts\TableSource;

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
        );
    }
}
