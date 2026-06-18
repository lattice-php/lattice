<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Sources\Eloquent;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Lattice\Lattice\Tables\RelationBinding;

/**
 * The Eloquent resolution of a to-one {@see RelationBinding} (e.g. the dotted
 * key `businessPartner.name`). Compiles each table concern to its idiomatic
 * Eloquent: a constrained eager load for display, a `whereHas` for filtering,
 * and a correlated subquery for sorting — so authors get relation columns
 * without hand-writing aggregates.
 */
final readonly class RelationColumn implements RelationProjection
{
    /**
     * @param  BelongsTo<Model, Model>|HasOne<Model, Model>  $relationInstance
     */
    private function __construct(
        private string $key,
        private string $relation,
        private string $field,
        private BelongsTo|HasOne $relationInstance,
    ) {}

    public static function resolve(Model $model, RelationBinding $binding): ?self
    {
        if (! $model->isRelation($binding->relation)) {
            return null;
        }

        $instance = $model->{$binding->relation}();

        if (! $instance instanceof BelongsTo && ! $instance instanceof HasOne) {
            return null;
        }

        return new self($binding->relation.'.'.$binding->field, $binding->relation, $binding->field, $instance);
    }

    public function key(): string
    {
        return $this->key;
    }

    public function relation(): string
    {
        return $this->relation;
    }

    public function field(): string
    {
        return $this->field;
    }

    public function project(Model $model): mixed
    {
        return data_get($model, $this->key);
    }

    /**
     * The related-table columns the constrained eager load selects: the leaf
     * field plus the key the relation matches on.
     *
     * @return list<string>
     */
    public function eagerColumns(): array
    {
        $matchKey = $this->relationInstance instanceof BelongsTo
            ? $this->relationInstance->getOwnerKeyName()
            : $this->relationInstance->getForeignKeyName();

        return array_values(array_unique([$matchKey, $this->field]));
    }

    /**
     * The base-table column the eager load matches against, which must survive an
     * explicit select() on the base query.
     */
    public function baseKey(): string
    {
        return $this->relationInstance instanceof BelongsTo
            ? $this->relationInstance->getForeignKeyName()
            : $this->relationInstance->getLocalKeyName();
    }

    /**
     * @param  Builder<*>  $builder
     * @param  Closure(Builder<*>): void  $constrain
     */
    public function applyFilter(Builder $builder, Closure $constrain): void
    {
        $builder->whereHas($this->relation, $constrain);
    }

    /**
     * @param  Builder<*>  $builder
     */
    public function applySort(Builder $builder, string $direction): void
    {
        $related = $this->relationInstance->getRelated();
        $baseTable = $builder->getModel()->getTable();
        $relatedTable = $related->getTable();

        $subquery = $related->newQuery()->select($this->field);

        if ($this->relationInstance instanceof BelongsTo) {
            $subquery->whereColumn(
                $relatedTable.'.'.$this->relationInstance->getOwnerKeyName(),
                $baseTable.'.'.$this->relationInstance->getForeignKeyName(),
            );
        } else {
            $subquery
                ->whereColumn(
                    $relatedTable.'.'.$this->relationInstance->getForeignKeyName(),
                    $baseTable.'.'.$this->relationInstance->getLocalKeyName(),
                )
                ->limit(1);
        }

        $builder->orderBy($subquery, $direction);
    }
}
