<?php
declare(strict_types=1);

namespace Lattice\Core\Services;

use Closure;

/**
 * The application-wide map from a context key to its resolver, registered
 * once per boot via `Lattice::context()`. {@see ContextResolutions} evaluates
 * the resolve closure and memoizes the result per request.
 */
final class ContextResolvers
{
    /** @var array<string, array{resolve: Closure, key: ?Closure, model: ?class-string}> */
    private array $resolvers = [];

    /**
     * Registering the same key twice replaces the previous registration —
     * the last call to `Lattice::context()` for a key wins. `$model` is set
     * only by the Eloquent sugar form of `Lattice::context()`, so {@see
     * keyForModel()} can seed a page's context frame from a bound route
     * model without any naming convention on the route parameter.
     *
     * @param  ?class-string  $model
     */
    public function register(string $key, Closure $resolve, ?Closure $keyBy = null, ?string $model = null): void
    {
        $this->resolvers[$key] = ['resolve' => $resolve, 'key' => $keyBy, 'model' => $model];
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->resolvers);
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->resolvers);
    }

    public function resolver(string $key): ?Closure
    {
        return $this->resolvers[$key]['resolve'] ?? null;
    }

    public function keyClosure(string $key): ?Closure
    {
        return $this->resolvers[$key]['key'] ?? null;
    }

    /**
     * The first registered key whose recorded Eloquent model class the given
     * object is an instance of, in registration order. Only keys registered
     * through the `Lattice::context($key, Model::class)` sugar carry a model
     * class, so a closure registration never matches.
     */
    public function keyForModel(object $model): ?string
    {
        foreach ($this->resolvers as $key => $entry) {
            if ($entry['model'] !== null && $model instanceof $entry['model']) {
                return $key;
            }
        }

        return null;
    }
}
