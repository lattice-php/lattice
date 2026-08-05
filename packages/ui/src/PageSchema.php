<?php
declare(strict_types=1);

namespace Lattice\Ui;

use Lattice\Core\Breadcrumb;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Ui\Concerns\ResolvesSchemaEntries;
use Lattice\Ui\Contracts\SchemaEntry;

final class PageSchema
{
    use FiltersRenderableComponents;
    use ResolvesSchemaEntries;

    /**
     * @var array<int, SchemaEntry>
     */
    private array $components = [];

    private ?string $title = null;

    /**
     * @var array<int, Breadcrumb>|null
     */
    private ?array $breadcrumbs = null;

    public static function make(): self
    {
        return new self;
    }

    /**
     * @param  array<int, SchemaEntry>  $components
     */
    public function schema(array $components): static
    {
        $this->components = $components;

        return $this;
    }

    public function component(Component $component): static
    {
        $this->components[] = $component;

        return $this;
    }

    /**
     * Read only by `Http\Page::toArray()` via {@see self::resolvedTitle()};
     * ignored when this schema builds a fragment or layout.
     */
    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Read only by `Http\Page::toArray()` via {@see self::resolvedBreadcrumbs()};
     * ignored when this schema builds a fragment or layout.
     *
     * @param  array<int, Breadcrumb>  $breadcrumbs
     */
    public function breadcrumbs(array $breadcrumbs): static
    {
        $this->breadcrumbs = $breadcrumbs;

        return $this;
    }

    public function resolvedTitle(): ?string
    {
        return $this->title;
    }

    /**
     * Null when render() set nothing, so the page's own breadcrumbs() applies;
     * an empty array is a deliberate override that clears them.
     *
     * @return array<int, Breadcrumb>|null
     */
    public function resolvedBreadcrumbs(): ?array
    {
        return $this->breadcrumbs;
    }

    /**
     * @return array<int, Component>
     */
    public function renderable(): array
    {
        return $this->renderableComponents($this->resolveSchemaEntries($this->components));
    }
}
