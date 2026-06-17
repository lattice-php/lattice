<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A column keyed by a dotted path into a to-one relation, e.g.
 * `businessPartner.name`. Resolves the relation against the model and compiles
 * each table concern to its idiomatic Eloquent: a constrained eager load for
 * display, a `whereHas` for filtering, and a correlated subquery for sorting —
 * so authors get relation columns without hand-writing aggregates.
 *
 * v1 handles a single relation segment of a BelongsTo or HasOne. Anything else
 * (no dot, multi-level, to-many, or a non-relation segment) resolves to null and
 * the key is left untouched.
 */
final readonly class RelationColumn
{
    /**
     * @param  BelongsTo<Model, Model>|HasOne<Model, Model>  $relationInstance
     */
    private function __construct(
        public string $key,
        public string $relation,
        public string $field,
        private BelongsTo|HasOne $relationInstance,
    ) {}

    public static function resolve(Model $model, string $key): ?self
    {
        if (! str_contains($key, '.')) {
            return null;
        }

        [$relation, $field] = explode('.', $key, 2);

        if ($field === '' || str_contains($field, '.') || ! $model->isRelation($relation)) {
            return null;
        }

        $instance = $model->{$relation}();

        if (! $instance instanceof BelongsTo && ! $instance instanceof HasOne) {
            return null;
        }

        return new self($key, $relation, $field, $instance);
    }

    public function value(Model $model): mixed
    {
        return data_get($model, $this->key);
    }

    /**
     * The related-table columns the constrained eager load must select: the leaf
     * field plus the key the relation matches on.
     *
     * @return list<string>
     */
    public function relatedColumns(): array
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
