<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\RichContent;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.paragraph', label: 'Paragraph', icon: Icon::Pilcrow, category: BlockCategory::Text, description: 'Formatted running text.', keywords: ['text', 'body', 'copy'])]
final class ParagraphBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            RichEditor::make('content', __('blocks::blocks.fields.content')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): RawBlock
    {
        $document = $data->document('content');

        return RawBlock::make()->html(
            $document === null
                ? '<p class="text-lt-muted-fg">'.e(__('blocks::blocks.placeholders.paragraph')).'</p>'
                : '<div class="lt-blocks-prose">'.RichContent::make($document)->toHtml().'</div>',
        );
    }
}
