<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Ui\Concerns\ResolvesSchemaEntries;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

final class PageSchema
{
    use FiltersRenderableComponents;
    use ResolvesSchemaEntries;

    /**
     * @var array<int, SchemaEntry>
     */
    private array $components = [];

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
     * @return array<int, Component>
     */
    public function renderable(): array
    {
        return $this->renderableComponents($this->resolveSchemaEntries($this->components));
    }
}
