<?php
declare(strict_types=1);

namespace Lattice\Core\Concerns;

use Illuminate\Database\Eloquent\Model;
use Lattice\Core\Definition;
use LogicException;

/**
 * Resolves a context value into an Eloquent record. With an explicit
 * `$model`, resolution goes through the model's own route binding, so a
 * context key resolves exactly as the same value would in a route —
 * `getRouteKeyName()` overrides and custom `resolveRouteBinding()` included.
 * Without one, resolution delegates to the registered resolver via
 * {@see Definition::contextModel()}/`contextModelOrNull()`, asserting the
 * result is an Eloquent model. Opt-in rather than part of {@see Definition}
 * because the package does not depend on illuminate/database.
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
        if ($model === null) {
            return $this->assertModel($key, parent::contextModel($key));
        }

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
        if ($model === null) {
            $resolved = parent::contextModelOrNull($key);

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
