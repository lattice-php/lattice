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
use Lattice\Form\Components\Select;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.spacer', label: 'Spacer', icon: Icon::MoveVertical, category: BlockCategory::Layout, description: 'Vertical white space.', keywords: ['gap', 'space', 'margin'])]
final class SpacerBlock extends BlockDefinition
{
    public const array HEIGHTS = ['sm' => 'h-4', 'md' => 'h-8', 'lg' => 'h-16', 'xl' => 'h-32'];

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
        return RawBlock::make()->html('<div class="'.$this->height($data).'" aria-hidden="true"></div>');
    }

    public function html(BlockData $data, BlockSlots $slots): View
    {
        return view('blocks::blocks.spacer', ['height' => $this->height($data)]);
    }

    private function size(BlockData $data): string
    {
        $size = $data->string('size')->toString();

        return array_key_exists($size, self::HEIGHTS) ? $size : 'md';
    }

    private function height(BlockData $data): string
    {
        return self::HEIGHTS[$this->size($data)];
    }
}
