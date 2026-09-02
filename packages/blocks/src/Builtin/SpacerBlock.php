<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\BlockSupports;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\Select;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.spacer', label: 'Spacer', icon: Icon::MoveVertical, category: BlockCategory::Layout, description: 'Vertical white space.', keywords: ['gap', 'space', 'margin'])]
final class SpacerBlock extends BlockDefinition
{
    private const array HEIGHTS = ['sm' => 'h-4', 'md' => 'h-8', 'lg' => 'h-16', 'xl' => 'h-32'];

    public function fields(): array
    {
        return [
            Select::make('size', __('blocks::blocks.fields.size'))
                ->options(['sm' => 'S', 'md' => 'M', 'lg' => 'L', 'xl' => 'XL'])
                ->value('md'),
        ];
    }

    public function supports(): BlockSupports
    {
        return BlockSupports::none()->with('visibility', 'anchor');
    }

    public function render(BlockData $data, BlockSlots $slots): RawBlock
    {
        $size = $data->string('size')->toString();
        $height = self::HEIGHTS[$size] ?? self::HEIGHTS['md'];

        return RawBlock::make()->html('<div class="'.$height.'" aria-hidden="true"></div>');
    }
}
