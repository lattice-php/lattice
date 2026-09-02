<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.heading', label: 'Heading', icon: Icon::Heading, category: BlockCategory::Text, description: 'A section title.', keywords: ['title', 'h1', 'h2'])]
final class HeadingBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            TextInput::make('text', __('blocks::blocks.fields.text'))->required()->rules(['max:200'])
                ->placeholder(__('blocks::blocks.placeholders.heading')),
            Select::make('level', __('blocks::blocks.fields.level'))
                ->options(['1' => 'H1', '2' => 'H2', '3' => 'H3', '4' => 'H4'])
                ->value('2'),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Heading
    {
        $text = $data->string('text')->toString();
        $level = max(1, min(6, (int) ($data->get('level') ?: 2)));

        return Heading::make($text === '' ? __('blocks::blocks.placeholders.heading') : $text, $level)->bind('text');
    }
}
