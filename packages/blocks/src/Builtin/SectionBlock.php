<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Blocks\Slot;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.section', label: 'Section', icon: Icon::Square, category: BlockCategory::Layout, description: 'Groups blocks under an optional title.', keywords: ['group', 'container', 'wrapper'])]
final class SectionBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            TextInput::make('title', __('blocks::blocks.fields.title')),
        ];
    }

    public function slots(?array $data = null): array
    {
        return [
            Slot::make('content')->label(__('blocks::blocks.slots.content')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Stack
    {
        $title = $data->string('title')->toString();

        return Stack::make()->gap(Gap::Medium)->schema(array_values(array_filter([
            $title === '' ? null : Heading::make($title, 2),
            $slots->render('content'),
        ])));
    }

    public function html(BlockData $data, BlockSlots $slots): View
    {
        return view('blocks::blocks.section', [
            'title' => $data->string('title')->toString(),
            'content' => $slots->html('content'),
        ]);
    }
}
