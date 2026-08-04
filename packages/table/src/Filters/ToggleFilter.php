<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A simple on/off filter. Add a schema to a custom Filter subclass when the
 * filter needs fields; use ToggleFilter when active state alone is enough.
 */
#[AsFilter(FilterControl::Toggle)]
final class ToggleFilter extends Filter
{
    private ?Closure $query = null;

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

    public function apply(Builder $builder, FormData $data): void
    {
        if (! $data->boolean('value')) {
            return;
        }

        if ($this->query instanceof Closure) {
            Evaluate::resolve(
                $this->query,
                Evaluate::context()
                    ->typed($builder::class, $builder)
                    ->typed(Request::class, request())
                    ->named('value', $data->get('value')),
            );

            return;
        }

        $builder->where($this->column(), true);
    }
}
