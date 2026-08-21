<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Breadcrumb;
use Lattice\Ui\BreadcrumbTrail;

/**
 * The breadcrumb trail of the active page. Without explicit items it serializes
 * whatever the page runtime recorded in {@see BreadcrumbTrail}, so one instance
 * in a layout serves every page.
 */
#[AsComponent('breadcrumbs')]
class Breadcrumbs extends Component
{
    /**
     * @var array<int, Breadcrumb>
     */
    public array $items = [];

    protected bool $hasExplicitItems = false;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  array<int, Breadcrumb>  $items
     */
    public function items(array $items): static
    {
        $this->items = array_values($items);
        $this->hasExplicitItems = true;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        return [
            ...parent::decorateProps($props),
            'items' => $this->hasExplicitItems ? $this->items : app(BreadcrumbTrail::class)->items(),
        ];
    }
}
