<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.quote', label: 'Quote', icon: Icon::Quote, category: BlockCategory::Text, description: 'A pull quote with an optional source.', keywords: ['blockquote', 'testimonial', 'cite'])]
final class QuoteBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            Textarea::make('quote', __('blocks::blocks.fields.quote'))->rows(3)->required(),
            TextInput::make('cite', __('blocks::blocks.fields.cite')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): RawBlock
    {
        $quote = $data->string('quote')->toString();
        $cite = $data->string('cite')->toString();
        $body = $quote === '' ? e(__('blocks::blocks.placeholders.quote')) : e($quote);
        $footer = $cite === '' ? '' : '<footer class="mt-2 text-sm text-lt-muted-fg">— '.e($cite).'</footer>';

        return RawBlock::make()->html(
            '<blockquote class="border-l-4 border-lt-border pl-4 text-lg italic text-lt-fg"><p>'.$body.'</p>'.$footer.'</blockquote>',
        );
    }
}
