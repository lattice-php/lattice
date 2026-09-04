<?php
declare(strict_types=1);

namespace Lattice\Support;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Core\Contracts\BuildsModelContextResolvers;
use LogicException;

/**
 * The Eloquent sugar behind `Lattice::context($key, Model::class, by: ...)`:
 * resolution goes through the model's own route binding, exactly like
 * {@see ResolvesContextModels}'s explicit-class form.
 */
final class EloquentContextResolvers implements BuildsModelContextResolvers
{
    public function resolver(string $model, ?string $by): Closure
    {
        $this->assertModelClass($model);

        return static fn (string|int $value): ?Model => (new $model)->resolveRouteBinding($value, $by);
    }

    public function keyBy(string $model, ?string $by): Closure
    {
        $this->assertModelClass($model);

        return static fn (Model $value): string|int => $by !== null ? $value->{$by} : $value->getRouteKey();
    }

    /**
     * @phpstan-assert class-string<Model> $model
     */
    private function assertModelClass(string $model): void
    {
        if (! is_a($model, Model::class, true)) {
            throw new LogicException(sprintf(
                'Lattice::context() Eloquent sugar requires an Eloquent model class, [%s] given.',
                $model,
            ));
        }
    }
}
