<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * A column whose value comes from an eager-loaded relation. The Eloquent source
 * loads the relation once (no N+1), flattens the projected value onto the row's
 * flat key, hides the nested relation, and filters through `whereHas`.
 * Implemented by RelationColumn (a dotted to-one key) and MultipleRelationColumn
 * (a to-many list).
 */
interface RelationProjection
{
    /** The flat row key the projected value is written under. */
    public function key(): string;

    /** The relation method to eager-load. */
    public function relation(): string;

    /** The related-model column a filter matches against (the leaf/label field). */
    public function field(): string;

    /**
     * The base-table column the relation matches on, which must survive an
     * explicit `select()` on the base query.
     */
    public function baseKey(): string;

    /**
     * Columns to select on the related model for a constrained eager load; an
     * empty list loads the full related rows.
     *
     * @return list<string>
     */
    public function eagerColumns(): array;

    /** The value written to the row under key(), resolved from the loaded model. */
    public function project(Model $model): mixed;

    /**
     * Constrain the base query to rows whose relation matches the filter.
     *
     * @param  Builder<*>  $builder
     * @param  Closure(Builder<*>): void  $constrain
     */
    public function applyFilter(Builder $builder, Closure $constrain): void;

    /**
     * Order the base query by the relation. To-one projections sort through a
     * correlated subquery; projections with no scalar ordering (a to-many list)
     * leave the query untouched.
     *
     * @param  Builder<*>  $builder
     */
    public function applySort(Builder $builder, string $direction): void;
}
