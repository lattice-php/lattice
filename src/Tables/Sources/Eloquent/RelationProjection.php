<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Sources\Eloquent;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * How the Eloquent driver resolves a column's {@see RelationBinding} into a
 * value: it loads the relation once (no N+1), flattens the projected value onto
 * the row's flat key, hides the nested relation, filters through `whereHas`, and
 * sorts to-one relations through a correlated subquery. This contract is
 * internal to the Eloquent driver — columns never see it. Implemented by
 * RelationColumn (a dotted to-one key) and MultipleRelationColumn (a to-many
 * list).
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
     * OR-constrain the base query to rows whose relation matches the filter —
     * the OR sibling of {@see applyFilter()}, used to build a search group.
     *
     * @param  Builder<*>  $builder
     * @param  Closure(Builder<*>): void  $constrain
     */
    public function applyOrFilter(Builder $builder, Closure $constrain): void;

    /**
     * Order the base query by the relation. To-one projections sort through a
     * correlated subquery; projections with no scalar ordering (a to-many list)
     * leave the query untouched.
     *
     * @param  Builder<*>  $builder
     */
    public function applySort(Builder $builder, string $direction): void;
}
