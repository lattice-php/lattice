<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Closure;
use InvalidArgumentException;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\PageRoute;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Concerns\HasAffixes;
use Lattice\Ui\Concerns\HasIcon;
use Lattice\Ui\Concerns\Triggerable;
use Lattice\Ui\Contracts\SchemaEntry;

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
        return static::make(PageRoute::label($page))
            ->href(PageRoute::href($page, $parameters));
    }

    /**
     * A menu item is a link/action/effect/modal trigger XOR a container with a
     * collapsible submenu — the two cannot mix.
     */
    protected function assertBehaviorAllowed(string $incoming): void
    {
        if ($this->children !== []) {
            throw new InvalidArgumentException('A menu item with children cannot be a link, action, effect, or modal trigger; only plain items can hold a collapsible submenu.');
        }

        $this->assertSingleBehavior($incoming);
    }

    /**
     * @param  array<int, SchemaEntry>  $children
     */
    public function children(array $children): static
    {
        if ($this->href !== null || $this->action instanceof Action || $this->effects !== [] || $this->modal instanceof Modal || $this->modalResolver instanceof Closure) {
            throw new InvalidArgumentException('A menu item that is a link, action, effect, or modal trigger cannot have children; only plain items can hold a collapsible submenu.');
        }

        return $this->schema($children);
    }
}
