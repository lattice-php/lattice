<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * The scoped-query half of an Eloquent-backed source: a consumer-provided
 * constraint closure applied to every query the source issues. The using class
 * carries the `$model` class-string.
 */
trait ScopedEloquentQuery
{
    /** @var Closure(Builder<Model>): mixed|null */
    private ?Closure $scope = null;

    /**
     * Constrain every query this source issues (e.g. only active rows).
     *
     * @param  Closure(Builder<Model>): mixed  $scope
     */
    public function scope(Closure $scope): static
    {
        $this->scope = $scope;

        return $this;
    }

    /**
     * @return Builder<Model>
     */
    private function query(): Builder
    {
        $builder = $this->model::query();

        if ($this->scope instanceof Closure) {
            $scoped = ($this->scope)($builder);

            if ($scoped instanceof Builder) {
                $builder = $scoped;
            }
        }

        return $builder;
    }
}
