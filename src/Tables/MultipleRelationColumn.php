<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lattice\Lattice\Tables\Contracts\RelationProjection;

/**
 * A column drawn from a to-many relation named by its key (`tags`), reading a
 * label field — and optionally a colour field — from each related row. The
 * relation is eager-loaded once (no N+1) and projected to a list: plain values,
 * or `{value, color}` pairs when a colour field is configured. Filtering matches
 * any related row through `whereHas`; the column is not sortable.
 *
 * v1 handles a single relation segment of a HasMany or BelongsToMany (so also
 * MorphToMany). Anything else resolves to null and the key is left untouched.
 */
final readonly class MultipleRelationColumn implements RelationProjection
{
    /**
     * @param  HasMany<Model, Model>|BelongsToMany<Model, Model>  $relationInstance
     */
    private function __construct(
        private string $key,
        private string $labelField,
        private ?string $colorField,
        private HasMany|BelongsToMany $relationInstance,
    ) {}

    public static function resolve(Model $model, string $key, string $labelField, ?string $colorField): ?self
    {
        if (str_contains($key, '.') || ! $model->isRelation($key)) {
            return null;
        }

        $instance = $model->{$key}();

        if (! $instance instanceof HasMany && ! $instance instanceof BelongsToMany) {
            return null;
        }

        return new self($key, $labelField, $colorField, $instance);
    }

    public function key(): string
    {
        return $this->key;
    }

    public function relation(): string
    {
        return $this->key;
    }

    public function field(): string
    {
        return $this->labelField;
    }

    public function baseKey(): string
    {
        return $this->relationInstance instanceof BelongsToMany
            ? $this->relationInstance->getParentKeyName()
            : $this->relationInstance->getLocalKeyName();
    }

    /**
     * @return list<string>
     */
    public function eagerColumns(): array
    {
        return [];
    }

    /**
     * @return list<mixed>
     */
    public function project(Model $model): array
    {
        $related = $model->getRelation($this->key);

        if (! $related instanceof Collection) {
            return [];
        }

        return $related
            ->map(function (Model $row): mixed {
                $value = $row->getAttribute($this->labelField);

                if ($this->colorField === null) {
                    return $value;
                }

                return [
                    'value' => $value,
                    'color' => (string) ($row->getAttribute($this->colorField) ?? 'gray'),
                ];
            })
            ->values()
            ->all();
    }

    public function applyFilter(Builder $builder, Closure $constrain): void
    {
        $builder->whereHas($this->key, $constrain);
    }

    /**
     * A to-many list has no scalar ordering, so sorting is a no-op. Such columns
     * also report not-sortable, so a validated query never reaches here.
     */
    public function applySort(Builder $builder, string $direction): void {}
}
