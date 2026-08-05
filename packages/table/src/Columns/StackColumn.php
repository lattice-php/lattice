<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Core\Contracts\ContainerComponent;
use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Enums\ColumnType;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use Lattice\Ui\Enums\ColumnWidth;

#[AsColumn(ColumnType::Stack)]
final class StackColumn extends Column implements ContainerComponent
{
    use HasChildSchema;

    public ColumnWidth $width = ColumnWidth::Xl;

    /**
     * @return array<int, Component>
     */
    public function children(): array
    {
        return $this->resolvedChildren();
    }

    /**
     * @return array<int, string>
     */
    #[\Override]
    public function boundRowKeys(): array
    {
        $keys = [];

        foreach ($this->renderableChildren() as $child) {
            array_push($keys, ...$child->boundRowKeys());
        }

        return array_values(array_unique($keys));
    }
}
