<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Tables\Attributes\AsFilter;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A three-state filter: true / false / all (unset). Defaults to a boolean column
 * constraint; pass {@see queries} to drive each state with a custom query (e.g.
 * null-existence checks). Custom queries receive the `Builder` by type injection.
 */
#[AsFilter(FilterControl::Ternary)]
class TernaryFilter extends BaseFilter
{
    public string $trueLabel = 'Yes';

    public string $falseLabel = 'No';

    public string $placeholder = 'All';

    private ?Closure $trueQuery = null;

    private ?Closure $falseQuery = null;

    public function trueLabel(string $label): static
    {
        $this->trueLabel = $label;

        return $this;
    }

    public function falseLabel(string $label): static
    {
        $this->falseLabel = $label;

        return $this;
    }

    public function placeholder(string $label): static
    {
        $this->placeholder = $label;

        return $this;
    }

    /**
     * @param  Closure(Builder<Model>): mixed  $true
     * @param  Closure(Builder<Model>): mixed  $false
     */
    public function queries(Closure $true, Closure $false): static
    {
        $this->trueQuery = $true;
        $this->falseQuery = $false;

        return $this;
    }

    #[\Override]
    public function accepts(mixed $value): bool
    {
        return is_scalar($value) && filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) !== null;
    }

    public function apply(Builder $builder, mixed $value): void
    {
        $state = is_scalar($value) ? filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;

        if ($state === null) {
            return;
        }

        $query = $state ? $this->trueQuery : $this->falseQuery;

        if ($query instanceof Closure) {
            Evaluate::resolve($query, Evaluate::context()->typed($builder::class, $builder));

            return;
        }

        $builder->where($this->column(), $state);
    }
}
