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
 * A key cascades when it is listed in `lattice.context.inherited_keys` or has
 * a resolver registered via `Lattice::context()` — a registered key always
 * inherits, config or not. Context can carry routing and policy values (the
 * bulk-action table key, media upload rules) that must never leak into a
 * child's sealed ref, so only the whitelisted/registered keys cascade, and
 * every value normalizes to a scalar (through {@see ContextResolutions}) so
 * a frame never carries an object.
 */
final class ContextScope
{
    /** Framework-routing keys that never cascade, whitelisted or not. */
    private const array RESERVED = ['table'];

    /** @var list<array<string, mixed>> */
    private array $frames = [];

    public function __construct(
        private readonly ContextResolvers $resolvers,
        private readonly ContextResolutions $resolutions,
    ) {}

    /**
     * @template TReturn
     *
     * @param  array<string, mixed>  $context
     * @param  Closure(): TReturn  $fn
     * @return TReturn
     */
    public function wrap(array $context, Closure $fn): mixed
    {
        $this->frames[] = $this->inheritableSubset($this->resolutions->normalize($context));

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
        $this->frames[] = $this->inheritableSubset($this->resolutions->normalize($context));
    }

    /**
     * Like {@see wrap()}, but filters to the registered/whitelisted subset
     * *before* normalizing rather than after. Use this when the raw context
     * may legitimately carry an object under a key with no resolver — a
     * slot's factory arguments, say — that must be dropped silently instead
     * of throwing.
     *
     * @template TReturn
     *
     * @param  array<string, mixed>  $context
     * @param  Closure(): TReturn  $fn
     * @return TReturn
     */
    public function wrapUntrusted(array $context, Closure $fn): mixed
    {
        return $this->wrap($this->inheritableSubset($context), $fn);
    }

    /**
     * @return array<string, mixed>
     */
    public function inheritable(): array
    {
        return $this->frames === [] ? [] : end($this->frames);
    }

    /**
     * The inherited frame at this instant, to replay later with {@see within()}
     * once the frame that captured it has already popped — a closure resolved
     * from a `#[SerializationHook]` (an embedded modal, a declared gate
     * subject) runs after the whole tree has serialized, not while it is
     * being built.
     *
     * @return array<string, mixed>
     */
    public function snapshot(): array
    {
        return $this->inheritable();
    }

    /**
     * Re-opens a frame captured by {@see snapshot()} for the duration of
     * `$fn`, so components it builds inherit it exactly as they would have
     * inherited the original frame.
     *
     * @template TReturn
     *
     * @param  array<string, mixed>  $frame
     * @param  Closure(): TReturn  $fn
     * @return TReturn
     */
    public function within(array $frame, Closure $fn): mixed
    {
        $this->frames[] = $frame;

        try {
            return $fn();
        } finally {
            array_pop($this->frames);
        }
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function inheritableSubset(array $context): array
    {
        $configured = config('lattice.context.inherited_keys', []);
        $configured = is_array($configured) ? $configured : [];

        $keys = [...$configured, ...$this->resolvers->keys()];

        if ($keys === []) {
            return [];
        }

        return array_diff_key(
            array_intersect_key($context, array_flip($keys)),
            array_flip(self::RESERVED),
        );
    }
}
