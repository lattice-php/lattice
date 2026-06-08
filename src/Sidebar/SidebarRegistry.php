<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Sidebar;

use Bambamboole\Lattice\Page;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\UrlGenerationException;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;

class SidebarRegistry
{
    public function __construct(
        private readonly Container $container,
        private readonly Router $router,
    ) {}

    /**
     * @return array{groups: array<int, array{label: string|null, items: array<int, array{active: bool, href: string, icon: string|null, key: string, label: string}>}>}
     */
    public function toArray(Request $request): array
    {
        $groups = [];

        foreach ($this->router->getRoutes()->getRoutes() as $route) {
            $item = $this->itemForRoute($route, $request);

            if ($item === null) {
                continue;
            }

            $groupKey = $item['group'] ?? '';

            $groups[$groupKey] ??= [
                'items' => [],
                'label' => $item['group'],
                'sort' => $item['sort'],
            ];

            $groups[$groupKey]['sort'] = min($groups[$groupKey]['sort'], $item['sort']);
            $groups[$groupKey]['items'][] = $item;
        }

        uasort($groups, fn (array $first, array $second): int => [$first['sort'], $first['label'] ?? ''] <=> [$second['sort'], $second['label'] ?? '']);

        return [
            'groups' => array_values(array_map(
                fn (array $group): array => [
                    'items' => array_values($this->sortItems($group['items'])),
                    'label' => $group['label'],
                ],
                $groups,
            )),
        ];
    }

    /**
     * @return array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, sort: int}|null
     */
    private function itemForRoute(Route $route, Request $request): ?array
    {
        $data = $route->getAction('lattice.sidebar');

        if (! is_array($data)) {
            return null;
        }

        $page = $route->getControllerClass();

        if (! is_string($page) || ! is_subclass_of($page, Page::class)) {
            return null;
        }

        if (! $this->container->make($page)->authorize($request)) {
            return null;
        }

        $item = SidebarItem::fromArray($data)->toArray();
        $href = $item['href'] ?? $this->hrefForRoute($route);

        if ($href === null || $item['label'] === null) {
            return null;
        }

        $routeName = $route->getName();

        return [
            'active' => $routeName !== null
                ? $request->routeIs($routeName)
                : '/'.ltrim($request->path(), '/') === $href,
            'group' => $item['group'],
            'href' => $href,
            'icon' => $item['icon'],
            'key' => $routeName ?? $href,
            'label' => $item['label'],
            'sort' => $item['sort'],
        ];
    }

    private function hrefForRoute(Route $route): ?string
    {
        if ($route->getName() !== null) {
            try {
                return route($route->getName(), absolute: false);
            } catch (UrlGenerationException) {
                return null;
            }
        }

        if (str_contains($route->uri(), '{')) {
            return null;
        }

        return '/'.ltrim($route->uri(), '/');
    }

    /**
     * @param  array<int, array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, sort: int}>  $items
     * @return array<int, array{active: bool, href: string, icon: string|null, key: string, label: string}>
     */
    private function sortItems(array $items): array
    {
        usort($items, fn (array $first, array $second): int => [$first['sort'], $first['label']] <=> [$second['sort'], $second['label']]);

        return array_map(
            fn (array $item): array => [
                'active' => $item['active'],
                'href' => $item['href'],
                'icon' => $item['icon'],
                'key' => $item['key'],
                'label' => $item['label'],
            ],
            $items,
        );
    }
}
