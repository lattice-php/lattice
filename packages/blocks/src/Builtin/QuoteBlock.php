<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Core\Enums\ColorName;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\Enums\Size;

#[AsBlock('lattice.quote', label: 'Quote', icon: Icon::Quote, category: BlockCategory::Text, description: 'A pull quote with an optional source.', keywords: ['blockquote', 'testimonial', 'cite'])]
final class QuoteBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            Textarea::make('quote', __('blocks::blocks.fields.quote'))->rows(3)->required()
                ->placeholder(__('blocks::blocks.placeholders.quote')),
            TextInput::make('cite', __('blocks::blocks.fields.cite'))
                ->placeholder(__('blocks::blocks.placeholders.cite')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Stack
    {
        $quote = $data->string('quote')->toString();
        $cite = $data->string('cite')->toString();

        return Stack::make()->gap(Gap::Small)->class('border-l-4 border-lt-border pl-4')->schema([
            Text::make($quote === '' ? __('blocks::blocks.placeholders.quote') : $quote)->size(Size::Lg)->class('italic')->bind('quote'),
            Text::make($cite)->size(Size::Sm)->color(ColorName::Muted)->bind('cite'),
        ]);
    }
}
