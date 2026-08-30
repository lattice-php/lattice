<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Board\Contracts\BoardSource;
use Lattice\Board\Sources\EloquentBoardSource;

/**
 * @template TModel of Model
 */
abstract class EloquentBoardDefinition extends BoardDefinition
{
    /**
     * @return class-string<TModel>
     */
    abstract public function model(): string;

    public function columnField(): string
    {
        return 'status';
    }

    public function positionField(): string
    {
        return 'position';
    }

    /**
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    public function query(Builder $query): Builder
    {
        return $query;
    }

    final public function source(): BoardSource
    {
        return new EloquentBoardSource(
            model: $this->model(),
            columns: $this->columns(),
            columnField: $this->columnField(),
            positionField: $this->positionField(),
            searchable: $this->searchable(),
            filters: $this->filters(),
            scope: fn (Builder $query): Builder => $this->query($query),
        );
    }
}
