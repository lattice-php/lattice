<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * The generic, custom filter: a toggle whose query logic the consumer supplies
 * via {@see query}. The closure is resolved with utility injection — a `Builder`
 * parameter receives the query, `$value` the toggle state, and any type-hinted
 * service resolves from the container.
 */
class Filter extends BaseFilter
{
    private ?Closure $query = null;

    public function toggle(): static
    {
        return $this;
    }

    /**
     * Constrain the query when the toggle is on.
     *
     * @param  Closure(Builder<Model>): mixed  $query
     */
    public function query(Closure $query): static
    {
        $this->query = $query;

        return $this;
    }

    public function toData(): FilterData
    {
        return new FilterData(
            $this->key,
            $this->label,
            FilterControl::Toggle,
            [],
        );
    }

    public function accepts(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) !== null;
    }

    public function apply(Builder $builder, mixed $value): void
    {
        if (filter_var($value, FILTER_VALIDATE_BOOLEAN) !== true) {
            return;
        }

        if ($this->query !== null) {
            Evaluate::resolve(
                $this->query,
                Evaluate::context()->typed($builder::class, $builder)->named('value', $value),
            );

            return;
        }

        $builder->where($this->column(), true);
    }
}
