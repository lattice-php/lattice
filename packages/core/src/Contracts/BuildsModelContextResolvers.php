<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

use Closure;

/**
 * Builds the resolve/key closures behind the Eloquent sugar of
 * `Lattice::context($key, Model::class, by: ...)`. Bound by the framework
 * package (which depends on illuminate/database) so core itself does not.
 */
interface BuildsModelContextResolvers
{
    /**
     * @param  class-string  $model
     */
    public function resolver(string $model, ?string $by): Closure;

    /**
     * @param  class-string  $model
     */
    public function keyBy(string $model, ?string $by): Closure;
}
