<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Core\Definition;

/**
 * Resolves a context value into an Eloquent record through the model's own
 * route binding, so a context key resolves exactly as the same value would in
 * a route — `getRouteKeyName()` overrides and custom `resolveRouteBinding()`
 * included. Opt-in rather than part of {@see Definition}
 * because the package does not depend on illuminate/database.
 *
 * @phpstan-require-extends Definition
 */
trait ResolvesContextModels
{
    /**
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @return TModel
     */
    protected function contextModel(string $key, string $model, ?string $by = null): Model
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
     * @param  class-string<TModel>  $model
     * @return TModel|null
     */
    protected function contextModelOrNull(string $key, string $model, ?string $by = null): ?Model
    {
        $value = $this->context($key);

        if ((! is_string($value) && ! is_int($value)) || $value === '') {
            return null;
        }

        $instance = new $model;

        return $instance->resolveRouteBinding($value, $by);
    }
}
