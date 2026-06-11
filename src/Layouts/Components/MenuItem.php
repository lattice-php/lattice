<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use BackedEnum;
use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Http\PageContract;

/**
 * A single menu entry. Renders an Inertia link when it has an href, otherwise a
 * plain label that can act as a section header for its nested children.
 */
#[Attributes\Component('menu-item', container: true)]
class MenuItem extends ContainerComponent
{
    use HasHttpMethod;

    public string $label = '';

    public ?string $href = null;

    public ?string $icon = null;

    public static function make(string $label, ?string $key = null): static
    {
        $item = new static($key);
        $item->label = $label;

        return $item;
    }

    /**
     * Build a menu item that links to a Lattice page, resolving the href from
     * the page's registered route and defaulting the label to the page name.
     *
     * @param  class-string  $page
     * @param  array<string, mixed>  $parameters
     */
    public static function fromPage(string $page, array $parameters = []): static
    {
        if (! is_a($page, PageContract::class, true)) {
            throw new InvalidArgumentException(sprintf(
                'Menu item page [%s] must implement [%s].',
                $page,
                PageContract::class,
            ));
        }

        $route = collect(app('router')->getRoutes()->getRoutes())->first(
            static fn (Route $route): bool => $route->getActionName() === $page.'@render',
        );

        if (! $route instanceof Route) {
            throw new InvalidArgumentException(sprintf(
                'No Lattice page route is registered for [%s].',
                $page,
            ));
        }

        return static::make(self::defaultLabel($page))
            ->href(app('url')->toRoute($route, $parameters, false));
    }

    public function href(string $href): static
    {
        $this->href = $href;

        return $this;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

        return $this;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @param  array<int, Component>  $children
     */
    public function children(array $children): static
    {
        return $this->schema($children);
    }

    /**
     * @param  class-string  $page
     */
    private static function defaultLabel(string $page): string
    {
        return Str::headline(Str::beforeLast(class_basename($page), 'Page'));
    }
}
