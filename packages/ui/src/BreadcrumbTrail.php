<?php
declare(strict_types=1);

namespace Lattice\Ui;

use Lattice\Core\Breadcrumb;

/**
 * The request-scoped breadcrumb trail of the page being rendered. The page
 * runtime sets it before the layout serializes, so a `Breadcrumbs` component
 * placed in a layout picks up the active page's crumbs at serialization time.
 */
final class BreadcrumbTrail
{
    /**
     * @var array<int, Breadcrumb>
     */
    private array $items = [];

    /**
     * @param  array<int, Breadcrumb>  $items
     */
    public function set(array $items): void
    {
        $this->items = array_values($items);
    }

    /**
     * @return array<int, Breadcrumb>
     */
    public function items(): array
    {
        return $this->items;
    }
}
