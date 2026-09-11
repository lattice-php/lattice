<?php
declare(strict_types=1);

namespace Lattice\Core\Concerns;

use Illuminate\Database\Eloquent\Model;
use Lattice\Core\Definition;
use Lattice\Core\Services\ContextResolvers;
use LogicException;

/**
 * Resolves a context value into an Eloquent record. A key with a resolver
 * registered through `Lattice::context()` resolves through it — so the
 * resolver's own rules, such as a dependent resolver's ownership check,
 * always apply — and an explicit `$model` asserts the result's class. A key
 * without a resolver, or an explicit `$by` column, resolves through the
 * model's own route binding instead, exactly as the same value would in a
 * route — `getRouteKeyName()` overrides and custom `resolveRouteBinding()`
 * included. Opt-in rather than part of {@see Definition} because the
 * package does not depend on illuminate/database.
 *
 * @phpstan-require-extends Definition
 */
trait ResolvesContextModels
{
    /**
     * @template TModel of Model
     *
     * @param  class-string<TModel>|null  $model
     * @return ($model is null ? Model : TModel)
     */
    protected function contextModel(string $key, ?string $model = null, ?string $by = null): Model
    {
        $resolved = $this->contextModelOrNull($key, $model, $by);

        if ($resolved === null) {
            abort(404);
        }

        return $resolved;
    }

    /**
     * Absent and not-found both yield null. A definition that must tell them
     * apart — an edit form where no id means "create" — tests
     * `$this->context($key)` for presence (`null`/`''`) itself, then calls
     * the strict {@see self::contextModel()} for the lookup. Do not swap in
     * `contextIntOrNull()` for the presence check: it silently folds
     * "present but non-numeric" (e.g. a UUID/ULID key) into "absent", turning
     * an edit into a create.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>|null  $model
     * @return ($model is null ? Model|null : TModel|null)
     */
    protected function contextModelOrNull(string $key, ?string $model = null, ?string $by = null): ?Model
    {
        if ($model === null || ($by === null && app(ContextResolvers::class)->has($key))) {
            $resolved = parent::contextModelOrNull($key, $model);

            return $resolved === null ? null : $this->assertModel($key, $resolved);
        }

        $value = $this->context($key);

        if ((! is_string($value) && ! is_int($value)) || $value === '') {
            return null;
        }

        $instance = new $model;

        return $instance->resolveRouteBinding($value, $by);
    }

    private function assertModel(string $key, object $resolved): Model
    {
        if (! $resolved instanceof Model) {
            throw new LogicException(sprintf(
                'Context [%s] resolved to [%s], which is not an Eloquent model.',
                $key,
                $resolved::class,
            ));
        }

        return $resolved;
    }
}
