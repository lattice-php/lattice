<?php
declare(strict_types=1);

namespace Lattice\Core\Services;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use InvalidArgumentException;
use Lattice\Core\Values\EndpointArea;
use LogicException;

/**
 * The component endpoints mounted once per area. Packages hand their endpoint
 * routes to {@see routes()} as a closure over an {@see EndpointArea}; the
 * closure registers them for the default area right away and for every named
 * area as it is registered, whichever comes first.
 *
 * The area a URL is minted for follows the request: an endpoint route carries
 * its area in its action, and a page declaring `#[AsPage(endpoints: …)]`
 * activates its area before it renders. Both are read from the current
 * request on every call, so this stays correct as an Octane singleton.
 */
final class EndpointAreas
{
    public const string ATTRIBUTE = 'lattice_endpoints';

    /** @var array<string, EndpointArea> */
    private array $areas = [];

    /** @var list<Closure(EndpointArea): void> */
    private array $routes = [];

    /**
     * @param  array<int, string>|string  $middleware
     */
    public function register(string $name, string $prefix, array|string $middleware = []): void
    {
        if ($name === '' || isset($this->areas[$name])) {
            throw new InvalidArgumentException(sprintf(
                'Lattice endpoint area [%s] is %s.',
                $name,
                $name === '' ? 'not a valid name' : 'already registered',
            ));
        }

        $area = EndpointArea::named($name, $prefix, (array) $middleware);
        $this->areas[$name] = $area;

        foreach ($this->routes as $routes) {
            $this->mount($area, $routes);
        }
    }

    /**
     * @param  Closure(EndpointArea): void  $routes
     */
    public function routes(Closure $routes): void
    {
        $this->routes[] = $routes;

        $this->mount(EndpointArea::default(), $routes);

        foreach ($this->areas as $area) {
            $this->mount($area, $routes);
        }
    }

    public function current(): EndpointArea
    {
        $request = app(Request::class);
        $name = $request->attributes->get(self::ATTRIBUTE);

        if (! is_string($name)) {
            $route = $request->route();
            $name = $route instanceof Route ? $route->getAction(self::ATTRIBUTE) : null;
        }

        if (! is_string($name)) {
            return EndpointArea::default();
        }

        return $this->areas[$name] ?? throw new LogicException(sprintf(
            'Lattice endpoint area [%s] is not registered. Register it with Lattice::endpoints().',
            $name,
        ));
    }

    /**
     * The relative URL of a default-area route's counterpart in the current area.
     *
     * @param  array<string, mixed>  $parameters
     */
    public function route(string $defaultName, array $parameters = []): string
    {
        return route($this->current()->routeName($defaultName), $parameters, absolute: false);
    }

    /**
     * Mints every component endpoint of the current request in the area.
     */
    public function activate(string $name): void
    {
        if (! isset($this->areas[$name])) {
            throw new InvalidArgumentException(sprintf(
                'Lattice endpoint area [%s] is not registered. Register it with Lattice::endpoints().',
                $name,
            ));
        }

        app(Request::class)->attributes->set(self::ATTRIBUTE, $name);
    }

    /**
     * @param  Closure(EndpointArea): void  $routes
     */
    private function mount(EndpointArea $area, Closure $routes): void
    {
        $app = app();

        if ($app->routesAreCached()) {
            return;
        }

        if ($area->isDefault()) {
            $routes($area);

            return;
        }

        $router = $app->make(Router::class);
        $router->group([self::ATTRIBUTE => $area->name], static fn () => $routes($area));
        $router->getRoutes()->refreshNameLookups();
    }
}
