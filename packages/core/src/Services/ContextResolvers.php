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
    /** @var array<string, array{resolve: Closure, key: ?Closure}> */
    private array $resolvers = [];

    /**
     * Registering the same key twice replaces the previous registration —
     * the last call to `Lattice::context()` for a key wins.
     */
    public function register(string $key, Closure $resolve, ?Closure $keyBy = null): void
    {
        $this->resolvers[$key] = ['resolve' => $resolve, 'key' => $keyBy];
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
}
