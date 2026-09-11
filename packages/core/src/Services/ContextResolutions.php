<?php
declare(strict_types=1);

namespace Lattice\Core\Services;

use BackedEnum;
use Closure;
use Illuminate\Http\Request;
use Lattice\Core\Support\Evaluation\Evaluator;
use LogicException;
use ReflectionFunction;
use ReflectionNamedType;

/**
 * Request-scoped evaluation of {@see ContextResolvers}: a resolver runs at
 * most once per request for a given key/value pair, however many definitions
 * ask for it, and the miss ("not found") is cached too. A resolver that reads
 * the surrounding context — a `$context` parameter, or another key through
 * this class — can answer the same value differently under another parent
 * (a client looked up within a realm), so its results are cached per
 * context as well.
 */
final class ContextResolutions
{
    /** @var array<string, object|null> */
    private array $cache = [];

    /** @var array<string, bool> */
    private array $readsContext = [];

    public function __construct(
        private readonly ContextResolvers $resolvers,
        private readonly Evaluator $evaluator,
        private readonly Request $request,
    ) {}

    /**
     * @param  array<string, mixed>  $context  The definition's full raw context, so a
     *                                         dependent resolver can read another key.
     */
    public function resolve(string $key, mixed $value, array $context): ?object
    {
        if (! $this->resolvers->has($key)) {
            throw $this->unregistered($key);
        }

        if ((! is_string($value) && ! is_int($value)) || $value === '') {
            return null;
        }

        $resolve = $this->resolvers->resolver($key) ?? throw $this->unregistered($key);
        $cacheKey = $key.'|'.$value;

        if ($this->readsContext[$key] ??= $this->readsContext($resolve)) {
            $cacheKey .= '|'.$this->fingerprint($context);
        }

        if (array_key_exists($cacheKey, $this->cache)) {
            return $this->cache[$cacheKey];
        }

        $result = $this->evaluator->resolve($resolve, $this->evaluator->context()
            ->named('value', $value)
            ->named('key', $key)
            ->named('context', $context)
            ->typed(Request::class, $this->request)
            ->typed(self::class, $this));

        return $this->cache[$cacheKey] = is_object($result) ? $result : null;
    }

    /**
     * Turns a resolved object back into its wire-safe scalar: the registered
     * `key` closure, or the object's own `getRouteKey()` when none was
     * registered.
     */
    public function serialize(string $key, object $model): string|int
    {
        if (! $this->resolvers->has($key)) {
            throw $this->unregistered($key);
        }

        $keyClosure = $this->resolvers->keyClosure($key);

        if (! $keyClosure instanceof Closure) {
            if (method_exists($model, 'getRouteKey')) {
                $routeKey = $model->getRouteKey();

                if (is_string($routeKey) || is_int($routeKey)) {
                    return $routeKey;
                }
            }

            throw new LogicException(sprintf(
                'Lattice context [%s] has no key resolver and [%s] has no getRouteKey() method. Pass a key: closure to Lattice::context(\'%s\', ...).',
                $key,
                $model::class,
                $key,
            ));
        }

        $result = $this->evaluator->resolve($keyClosure, $this->evaluator->context()
            ->named('value', $model)
            ->named('key', $key)
            ->typed($model::class, $model)
            ->typed(Request::class, $this->request));

        if (! is_string($result) && ! is_int($result)) {
            throw new LogicException(sprintf(
                'The key resolver registered for Lattice context [%s] must return a string or int, got [%s].',
                $key,
                get_debug_type($result),
            ));
        }

        return $result;
    }

    /**
     * Turns every object value in a raw context array into its wire-safe
     * scalar via {@see self::serialize()}, so neither a gate, `withContext()`,
     * nor a sealed ref ever carries a model. A `BackedEnum` normalizes to its
     * backing `->value` regardless of whether a resolver is registered for
     * the key — it was always wire-safe on its own. An object under a key
     * without a registered resolver throws rather than being silently
     * JSON-encoded wholesale into a sealed ref.
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function normalize(array $context): array
    {
        foreach ($context as $key => $value) {
            if ($value instanceof BackedEnum) {
                $context[$key] = $value->value;

                continue;
            }

            if (! is_object($value)) {
                continue;
            }

            $key = (string) $key;

            if (! $this->resolvers->has($key)) {
                throw new LogicException(sprintf(
                    'Lattice context values must be scalar unless a resolver is registered for [%s]. Register one with Lattice::context(), or pass the scalar value directly.',
                    $key,
                ));
            }

            $context[$key] = $this->serialize($key, $value);
        }

        return $context;
    }

    private function readsContext(Closure $resolve): bool
    {
        foreach (new ReflectionFunction($resolve)->getParameters() as $parameter) {
            $type = $parameter->getType();

            if ($parameter->getName() === 'context' || ($type instanceof ReflectionNamedType && $type->getName() === self::class)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function fingerprint(array $context): string
    {
        ksort($context);

        return hash('xxh128', serialize(array_map(
            static fn (mixed $value): mixed => is_object($value) ? $value::class.'#'.spl_object_id($value) : $value,
            $context,
        )));
    }

    private function unregistered(string $key): LogicException
    {
        return new LogicException(sprintf(
            'No context resolver is registered for [%s]. Register one with Lattice::context().',
            $key,
        ));
    }
}
