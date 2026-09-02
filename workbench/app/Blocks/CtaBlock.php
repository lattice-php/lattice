<?php
declare(strict_types=1);

namespace Workbench\App\Blocks;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\BlockSupports;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Size;

#[AsBlock('workbench.cta', label: 'Call to action', icon: Icon::Send, category: BlockCategory::Layout, description: 'A closing prompt with one button.', keywords: ['cta', 'button', 'signup'])]
final class CtaBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            TextInput::make('title', __('workbench.blocks.cta.title'))->required(),
            TextInput::make('text', __('workbench.blocks.cta.text')),
            TextInput::make('button_label', __('workbench.blocks.cta.button-label'))->required(),
        ];
    }

    public function supports(): BlockSupports
    {
        return BlockSupports::all()->without('align');
    }

    public function render(BlockData $data, BlockSlots $slots): Stack
    {
        $text = $data->string('text')->toString();

        return Stack::make()
            ->direction(Orientation::Horizontal)
            ->align(Align::Center)
            ->justify(Justify::Between)
            ->gap(Gap::Large)
            ->class('rounded-lt bg-lt-fg px-6 py-5 text-lt-bg')
            ->schema([
                Stack::make()->gap(Gap::ExtraSmall)->schema(array_filter([
                    Heading::make($data->string('title')->toString() ?: __('workbench.blocks.cta.placeholder'), 3),
                    $text === '' ? null : Text::make($text)->size(Size::Sm),
                ])),
                Button::make($data->string('button_label')->toString() ?: __('workbench.blocks.cta.button-placeholder')),
            ]);
    }
}
