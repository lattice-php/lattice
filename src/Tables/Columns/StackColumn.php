<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Stack)]
class StackColumn extends Column
{
    use FiltersRenderableComponents;

    /**
     * @var array<int, Column>
     */
    protected array $columns = [];

    /**
     * @param  array<int, Column>  $columns
     */
    public function columns(array $columns): static
    {
        $this->columns = $columns;

        return $this;
    }

    /**
     * @return array<int, Column>
     */
    public function children(): array
    {
        return $this->columns;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        $props['columns'] = array_map(
            fn (Column $column): array => $column->jsonSerialize(),
            array_values($this->renderableComponents($this->columns)),
        );

        return $props;
    }

    #[\Override]
    protected function defaultWidth(): ColumnWidth
    {
        return ColumnWidth::Xl;
    }
}
