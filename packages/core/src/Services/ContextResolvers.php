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
     * the last call to `Lattice::context()` for a key wins. `$model` is the
     * class the key resolves to — recorded by the Eloquent sugar, inferred
     * from a closure's declared return type, or passed as `model:` — so
     * {@see keyForModel()} can seed a page's context frame from a bound
     * route model without any naming convention on the route parameter.
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
     * The first registered key whose recorded model class the given object
     * is an instance of, in registration order. A closure registration
     * without a declared class return type (or an explicit `model:`) carries
     * no class and never matches.
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
