<?php

declare(strict_types=1);

namespace Lattice\Lattice\Pages;

use Illuminate\Routing\Router;
use Lattice\Lattice\Attributes\Page as PageAttribute;
use Lattice\Lattice\Core\Contracts\Discoverable;
use Lattice\Lattice\Http\PageContract;
use Lattice\Lattice\Http\PageMetadata;
use ReflectionClass;

final class PageRegistry implements Discoverable
{
    public function __construct(private readonly Router $router) {}

    /**
     * @param  class-string|array<int, class-string>  $pages
     */
    public function register(string|array $pages): void
    {
        foreach ((array) $pages as $page) {
            $this->registerRoute($page);
        }
    }

    /**
     * @param  array<int, class-string>  $definitions
     */
    public function registerDiscovered(array $definitions): void
    {
        foreach ($definitions as $definition) {
            $this->registerRoute($definition);
        }
    }

    public function attributeClass(): string
    {
        return PageAttribute::class;
    }

    public function group(): string
    {
        return 'pages';
    }

    /**
     * @param  class-string  $page
     */
    private function registerRoute(string $page): void
    {
        if (! is_a($page, PageContract::class, true) || (new ReflectionClass($page))->isAbstract()) {
            return;
        }

        $metadata = PageMetadata::for($page);

        if ($metadata->route === null) {
            return;
        }

        $route = $this->router->get($metadata->route, [$page, 'render']);
        $route->name($metadata->name);

        if ($metadata->middleware !== []) {
            $route->middleware($metadata->middleware);
        }

        $this->router->getRoutes()->refreshNameLookups();
    }
}
