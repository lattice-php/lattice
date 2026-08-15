<?php
declare(strict_types=1);

namespace Lattice\Layouts\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Contracts\SchemaEntry;

/**
 * A fixed-width navigation column rendered alongside the page content in a
 * layout schema.
 */
#[AsComponent('sidebar')]
class Sidebar extends ContainerComponent
{
    public bool $collapsible = false;

    public bool $rememberState = true;

    protected ?SidebarFooter $footerNode = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function collapsible(bool $collapsible = true, bool $rememberState = true): static
    {
        $this->collapsible = $collapsible;
        $this->rememberState = $rememberState;

        return $this;
    }

    /**
     * @param  array<int, SchemaEntry>  $components
     */
    public function items(array $components): static
    {
        return $this->schema($components);
    }

    /**
     * Pin components to the bottom of the sidebar, below the items.
     *
     * @param  array<int, SchemaEntry>  $components
     */
    public function footer(array $components): static
    {
        $this->footerNode = SidebarFooter::make()->schema($components);

        return $this;
    }

    /**
     * @return array<int, Component>
     */
    #[\Override]
    protected function resolvedChildren(): array
    {
        $children = parent::resolvedChildren();

        return ! $this->footerNode instanceof SidebarFooter ? $children : [...$children, $this->footerNode];
    }
}
