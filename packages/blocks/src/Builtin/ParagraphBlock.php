<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Components\RichText;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Form\RichEditor\Extensions\Code;
use Lattice\Form\RichEditor\Extensions\Highlight;
use Lattice\Form\RichEditor\Extensions\Italic;
use Lattice\Form\RichEditor\Extensions\Link;
use Lattice\Form\RichEditor\Extensions\Strike;
use Lattice\Form\RichEditor\Extensions\Underline;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.paragraph', label: 'Paragraph', icon: Icon::Pilcrow, category: BlockCategory::Text, description: 'Formatted running text.', keywords: ['text', 'body', 'copy'])]
final class ParagraphBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            RichEditor::make('content', __('blocks::blocks.fields.content'))
                ->extensions([Bold::class, Italic::class, Underline::class, Strike::class, Highlight::class, Code::class, Link::class])
                ->placeholder(__('blocks::blocks.placeholders.paragraph')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): RichText
    {
        return RichText::make($data->document('content'), __('blocks::blocks.placeholders.paragraph'))->bind('content');
    }

    public function html(BlockData $data, BlockSlots $slots): View|string
    {
        $document = $data->document('content');

        return RichText::isBlank($document)
            ? ''
            : view('blocks::blocks.paragraph', ['html' => RichText::toHtml($document)]);
    }
}
