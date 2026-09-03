<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\BlockSupports;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Ui\Components\Separator;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.separator', label: 'Separator', icon: Icon::Minus, category: BlockCategory::Layout, description: 'A horizontal rule.', keywords: ['divider', 'hr', 'line'])]
final class SeparatorBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [];
    }

    public function supports(): BlockSupports
    {
        return BlockSupports::all()->without('background', 'align');
    }

    public function render(BlockData $data, BlockSlots $slots): Separator
    {
        return Separator::make();
    }

    public function html(BlockData $data, BlockSlots $slots): View
    {
        return view('blocks::blocks.separator');
    }
}
