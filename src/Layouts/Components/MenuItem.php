<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Concerns\HasAffixes;
use Lattice\Lattice\Ui\Concerns\HasIcon;
use Lattice\Lattice\Ui\Concerns\Triggerable;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

/**
 * A single menu entry. Renders an Inertia link when it has an href, triggers a
 * registered action or effects when bound to one, otherwise a plain label that
 * can act as a section header for its nested children.
 */
#[AsComponent('menu-item')]
class MenuItem extends ContainerComponent
{
    use HasAffixes;
    use HasIcon;
    use Triggerable {
        assertBehaviorAllowed as private assertSingleBehavior;
    }

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

    /**
     * A menu item is a link/action/effect trigger XOR a container with a
     * collapsible submenu — the two cannot mix.
     */
    protected function assertBehaviorAllowed(string $incoming): void
    {
        if ($this->children !== []) {
            throw new InvalidArgumentException('A menu item with children cannot be a link, action, or effect trigger; only plain items can hold a collapsible submenu.');
        }

        $this->assertSingleBehavior($incoming);
    }

    /**
     * @param  array<int, SchemaEntry>  $children
     */
    public function children(array $children): static
    {
        if ($this->href !== null || $this->action instanceof Action || $this->effects !== []) {
            throw new InvalidArgumentException('A menu item that is a link, action, or effect trigger cannot have children; only plain items can hold a collapsible submenu.');
        }

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
