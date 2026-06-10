<?php

declare(strict_types=1);

namespace Lattice\Lattice\Menu;

use BackedEnum;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\UrlGenerationException;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Lattice\Lattice\Core\Contracts\Authorizable;

final class MenuRegistry
{
    /**
     * @var array<string, array<int, MenuItem>>
     */
    private array $items = [];

    public function __construct(
        private readonly Container $container,
        private readonly Router $router,
    ) {}

    public function add(BackedEnum|string $location, MenuItem $item): static
    {
        $this->items[$this->locationKey($location)][] = $item;

        return $this;
    }

    /**
     * @return array<string, array{groups: array<int, array{label: string|null, items: array<int, array{active: bool, href: string, icon: string|null, key: string, label: string, method: string}>}>}>
     */
    public function toArray(Request $request): array
    {
        $menus = [];

        foreach ($this->items as $location => $items) {
            foreach ($items as $item) {
                $this->appendItem($menus, $location, $this->itemForDefinition($item, $request));
            }
        }

        foreach ($this->router->getRoutes()->getRoutes() as $route) {
            $menuItems = $route->getAction('lattice.menus');

            if (! is_array($menuItems)) {
                continue;
            }

            foreach ($menuItems as $location => $data) {
                if (! is_string($location) || ! is_array($data)) {
                    continue;
                }

                $this->appendItem($menus, $location, $this->itemForRoute($route, $request, MenuItem::fromArray($data)));
            }
        }

        ksort($menus);

        return array_map(fn (array $groups): array => [
            'groups' => array_values(array_map(
                fn (array $group): array => [
                    'items' => array_values($this->sortItems($group['items'])),
                    'label' => $group['label'],
                ],
                $this->sortGroups($groups),
            )),
        ], $menus);
    }

    private function locationKey(BackedEnum|string $location): string
    {
        return $location instanceof BackedEnum ? (string) $location->value : $location;
    }

    /**
     * @param  array<string, array<string, array{items: array<int, array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}>, label: string|null, sort: int}>>  $menus
     * @param  array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}|null  $item
     */
    private function appendItem(array &$menus, string $location, ?array $item): void
    {
        if ($item === null) {
            return;
        }

        $groupKey = $item['group'] ?? '';

        $menus[$location][$groupKey] ??= [
            'items' => [],
            'label' => $item['group'],
            'sort' => $item['sort'],
        ];

        $menus[$location][$groupKey]['sort'] = min($menus[$location][$groupKey]['sort'], $item['sort']);
        $menus[$location][$groupKey]['items'][] = $item;
    }

    /**
     * @return array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}|null
     */
    private function itemForDefinition(MenuItem $item, Request $request): ?array
    {
        $href = $item->getHref();

        if ($href === null) {
            return null;
        }

        return $this->serializeItem(
            $item,
            $href,
            '/'.ltrim($request->path(), '/') === $href,
            $href,
        );
    }

    /**
     * @return array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}|null
     */
    private function itemForRoute(Route $route, Request $request, MenuItem $item): ?array
    {
        $page = $route->getControllerClass();

        if (is_string($page) && is_a($page, Authorizable::class, true) && ! $this->container->make($page)->authorize($request)) {
            return null;
        }

        $href = $item->getHref() ?? $this->hrefForRoute($route);

        if ($href === null) {
            return null;
        }

        $routeName = $route->getName();

        return $this->serializeItem(
            $item,
            $href,
            $routeName !== null
                ? $request->routeIs($routeName)
                : '/'.ltrim($request->path(), '/') === $href,
            $routeName ?? $href,
        );
    }

    /**
     * @return array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}|null
     */
    private function serializeItem(MenuItem $item, string $href, bool $active, string $fallbackKey): ?array
    {
        $label = $item->getLabel();

        if ($label === null) {
            return null;
        }

        return [
            'active' => $active,
            'group' => $item->getGroup(),
            'href' => $href,
            'icon' => $item->getIcon(),
            'key' => $item->getKey() ?? $fallbackKey,
            'label' => $label,
            'method' => $item->getMethod(),
            'sort' => $item->getSort(),
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
     * @param  array<string, array{items: array<int, array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}>, label: string|null, sort: int}>  $groups
     * @return array<int, array{items: array<int, array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}>, label: string|null, sort: int}>
     */
    private function sortGroups(array $groups): array
    {
        uasort($groups, fn (array $first, array $second): int => [$first['sort'], $first['label'] ?? ''] <=> [$second['sort'], $second['label'] ?? '']);

        return array_values($groups);
    }

    /**
     * @param  array<int, array{active: bool, group: string|null, href: string, icon: string|null, key: string, label: string, method: string, sort: int}>  $items
     * @return array<int, array{active: bool, href: string, icon: string|null, key: string, label: string, method: string}>
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
                'method' => $item['method'],
            ],
            $items,
        );
    }
}
