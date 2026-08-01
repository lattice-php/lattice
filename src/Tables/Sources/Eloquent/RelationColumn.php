<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Sources\Eloquent;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\Relation;
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
     * @param  BelongsTo<Model, Model>|HasOne<Model, Model>|MorphOne<Model, Model>  $relationInstance
     */
    private function __construct(
        private string $key,
        private string $relation,
        private string $field,
        private BelongsTo|HasOne|MorphOne $relationInstance,
    ) {}

    public static function resolve(Model $model, RelationBinding $binding): ?self
    {
        if (! $model->isRelation($binding->relation)) {
            return null;
        }

        $instance = $model->{$binding->relation}();

        if (! $instance instanceof BelongsTo && ! $instance instanceof HasOne && ! $instance instanceof MorphOne) {
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
     * @param  Closure(Builder<*>): void  $constrain
     */
    public function applyOrFilter(Builder $builder, Closure $constrain): void
    {
        $builder->orWhereHas($this->relation, $constrain);
    }

    /**
     * Sorts through a correlated subquery built the same way Eloquent builds
     * `whereHas`: rebuild the relation with its automatic parent-key constraint
     * suppressed (`Relation::noConstraints()`) so only the relation's own extra
     * `where()` calls survive (e.g. a `hasOne()->where('channel', 'email')`),
     * then let the relation compile its own correlation (`getRelationExistenceQuery`)
     * and merge those extra constraints back in. This also covers `MorphOne`,
     * whose type constraint `getRelationExistenceQuery` adds automatically.
     *
     * @param  Builder<*>  $builder
     */
    public function applySort(Builder $builder, string $direction): void
    {
        $model = $builder->getModel();

        /** @var BelongsTo<Model, Model>|HasOne<Model, Model>|MorphOne<Model, Model> $relation */
        $relation = Relation::noConstraints(fn () => $model->{$this->relation}());

        $subquery = $relation
            ->getRelationExistenceQuery($relation->getRelated()->newQueryWithoutRelationships(), $model->newQuery(), [$this->field])
            ->mergeConstraintsFrom($relation->getQuery())
            ->limit(1);

        $builder->orderBy($subquery, $direction);
    }
}
