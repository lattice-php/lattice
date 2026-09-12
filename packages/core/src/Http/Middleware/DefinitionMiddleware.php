<?php
declare(strict_types=1);

namespace Lattice\Core\Http\Middleware;

use Closure;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Pipeline\Pipeline;
use Illuminate\Routing\Router;
use Lattice\Core\DefinitionRegistry;
use Symfony\Component\HttpFoundation\Response;

/**
 * Runs a definition endpoint behind the stack its attribute declares, falling
 * back to the configured default when it declares none.
 *
 * A page owns its route, so its middleware is fixed when the route is built.
 * One catch-all route serves every definition of a kind, so the stack can only
 * be known once the route parameter names which definition the request is
 * for — hence a nested pipeline around the controller rather than middleware
 * on the route. The declared stack replaces the default rather than merging
 * with it, or a definition could never drop the `auth` the default carries.
 */
final readonly class DefinitionMiddleware
{
    public function __construct(private Container $container, private Router $router) {}

    /**
     * @param  class-string<DefinitionRegistry<*>>  $registry
     * @param  string  $parameter  The route parameter naming the definition.
     * @param  string  $config  Dotted config key holding the default stack.
     */
    public static function for(string $registry, string $parameter, string $config): string
    {
        return self::class.':'.$registry.','.$parameter.','.$config;
    }

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $registry, string $parameter, string $config): Response
    {
        $definitions = $this->container->make($registry);

        $declared = $definitions instanceof DefinitionRegistry
            ? $definitions->middlewareFor((string) $request->route($parameter))
            : null;

        return new Pipeline($this->container)
            ->send($request)
            ->through($this->router->resolveMiddleware($declared ?? $this->default($config)))
            ->then($next);
    }

    /**
     * @return array<int, string>
     */
    private function default(string $config): array
    {
        $middleware = config($config, ['web', 'auth']);

        return is_array($middleware) ? array_values(array_filter($middleware, is_string(...))) : [];
    }
}
