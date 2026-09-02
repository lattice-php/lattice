<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Components\RichText;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Form\RichEditor\Extensions\BulletList;
use Lattice\Form\RichEditor\Extensions\Italic;
use Lattice\Form\RichEditor\Extensions\Link;
use Lattice\Form\RichEditor\Extensions\OrderedList;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.list', label: 'List', icon: Icon::List, category: BlockCategory::Text, description: 'Bulleted or numbered items.', keywords: ['bullets', 'numbered', 'items'])]
final class ListBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            RichEditor::make('content', __('blocks::blocks.fields.items.label'))
                ->extensions([BulletList::class, OrderedList::class, Bold::class, Italic::class, Link::class])
                ->placeholder(__('blocks::blocks.placeholders.list'))
                ->value(self::emptyList()),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): RichText
    {
        return RichText::make($data->document('content'), __('blocks::blocks.placeholders.list'))->bind('content');
    }

    /**
     * @return array<string, mixed>
     */
    public static function emptyList(): array
    {
        return [
            'type' => 'doc',
            'content' => [[
                'type' => 'bulletList',
                'content' => [['type' => 'listItem', 'content' => [['type' => 'paragraph']]]],
            ]],
        ];
    }
}
