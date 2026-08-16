<?php
declare(strict_types=1);

namespace Lattice\Core\Services;

use Closure;

/**
 * Request-scoped stack of inheritable component context. The definition
 * registries wrap every authorized component build in a frame so components
 * built inside a definition (row actions, modal forms, nested actions)
 * inherit the whitelisted keys of their parent's context without manual
 * re-threading; endpoints activate a frame so the response paths that
 * rebuild children (table rows, form schemas, fragments) behave identically.
 *
 * Only keys listed in `lattice.context.inherited_keys` cascade — context can
 * carry routing and policy values (the bulk-action table key, media upload
 * rules) that must never leak into a child's sealed ref.
 */
final class ContextScope
{
    /** Framework-routing keys that never cascade, whitelisted or not. */
    private const array RESERVED = ['table'];

    /** @var list<array<string, mixed>> */
    private array $frames = [];

    /**
     * @template TReturn
     *
     * @param  array<string, mixed>  $context
     * @param  Closure(): TReturn  $fn
     * @return TReturn
     */
    public function wrap(array $context, Closure $fn): mixed
    {
        $this->frames[] = $this->inheritableSubset($context);

        try {
            return $fn();
        } finally {
            array_pop($this->frames);
        }
    }

    /**
     * Push without pop: an endpoint activates its trusted context once for
     * the lifetime of this request-scoped instance.
     *
     * @param  array<string, mixed>  $context
     */
    public function activate(array $context): void
    {
        $this->frames[] = $this->inheritableSubset($context);
    }

    /**
     * @return array<string, mixed>
     */
    public function inheritable(): array
    {
        return $this->frames === [] ? [] : end($this->frames);
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function inheritableSubset(array $context): array
    {
        $keys = config('lattice.context.inherited_keys', []);

        if (! is_array($keys) || $keys === []) {
            return [];
        }

        return array_diff_key(
            array_intersect_key($context, array_flip($keys)),
            array_flip(self::RESERVED),
        );
    }
}
