<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\Textarea;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.list', label: 'List', icon: Icon::List, category: BlockCategory::Text, description: 'Bulleted or numbered items, one per line.', keywords: ['bullets', 'numbered', 'items'])]
final class ListBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            Textarea::make('items', __('blocks::blocks.fields.items.label'))->rows(5)->helperText(__('blocks::blocks.fields.items.help-text')),
            Select::make('style', __('blocks::blocks.fields.list-style'))
                ->options(['bullet' => __('blocks::blocks.options.bullet'), 'ordered' => __('blocks::blocks.options.ordered')])
                ->value('bullet'),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): RawBlock
    {
        $items = array_values(array_filter(array_map(trim(...), preg_split('/\R/', $data->string('items')->toString()) ?: [])));
        $tag = $data->get('style') === 'ordered' ? 'ol' : 'ul';
        $class = $tag === 'ol' ? 'list-decimal' : 'list-disc';

        if ($items === []) {
            return RawBlock::make()->html('<p class="text-lt-muted-fg">'.e(__('blocks::blocks.placeholders.list')).'</p>');
        }

        $html = implode('', array_map(static fn (string $item): string => '<li>'.e($item).'</li>', $items));

        return RawBlock::make()->html("<{$tag} class=\"{$class} space-y-1 pl-6\">{$html}</{$tag}>");
    }
}
