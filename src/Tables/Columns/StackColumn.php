<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Stack)]
class StackColumn extends Column
{
    use FiltersRenderableComponents;

    public ColumnWidth $width = ColumnWidth::Xl;

    /**
     * @var array<int, Component>
     */
    protected array $children = [];

    /**
     * @param  array<int, Component>  $components
     */
    public function schema(array $components): static
    {
        $this->children = $components;

        return $this;
    }

    /**
     * @return array<int, Component>
     */
    public function children(): array
    {
        return $this->children;
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function jsonSerialize(): array
    {
        return [
            ...parent::jsonSerialize(),
            'schema' => array_map(
                fn (Component $component): array => $component->jsonSerialize(),
                array_values($this->renderableComponents($this->children)),
            ),
        ];
    }
}
