<?php
declare(strict_types=1);

namespace Lattice\Core;

use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Lattice\Core\Contracts\PageContract;

/**
 * Resolves the href and default label of a registered Lattice page, shared by
 * every component that links to one.
 */
final class PageRoute
{
    /**
     * @param  class-string  $page
     * @param  array<string, mixed>  $parameters
     */
    public static function href(string $page, array $parameters = []): string
    {
        if (! is_a($page, PageContract::class, true)) {
            throw new InvalidArgumentException(sprintf(
                'Page [%s] must implement [%s].',
                $page,
                PageContract::class,
            ));
        }

        $route = self::route($page);

        if (! $route instanceof Route) {
            throw new InvalidArgumentException(sprintf(
                'No Lattice page route is registered for [%s].',
                $page,
            ));
        }

        return app('url')->toRoute($route, $parameters, false);
    }

    /**
     * @param  class-string  $page
     */
    public static function label(string $page): string
    {
        return Str::headline(Str::beforeLast(class_basename($page), 'Page'));
    }

    /**
     * Pages booted by Lattice are named routes, so the name lookup is the fast
     * path; a page route registered by hand may be unnamed, hence the scan.
     *
     * @param  class-string  $page
     */
    private static function route(string $page): ?Route
    {
        $routes = app('router')->getRoutes();
        $action = $page.'@render';
        $named = $routes->getByName(PageMetadata::for($page)->name);

        if ($named instanceof Route && $named->getActionName() === $action) {
            return $named;
        }

        return collect($routes->getRoutes())->first(
            static fn (Route $route): bool => $route->getActionName() === $action,
        );
    }
}
