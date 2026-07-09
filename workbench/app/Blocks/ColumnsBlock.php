<?php
declare(strict_types=1);

namespace Workbench\App\Blocks;

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\FormData;

#[AsBlock('workbench.columns')]
final class ColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[\Override]
    public function slots(): array
    {
        return ['main'];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Grid::make()->schema($slots->get('main')));
    }
}
