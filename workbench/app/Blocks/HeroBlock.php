<?php
declare(strict_types=1);

namespace Workbench\App\Blocks;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Builtin\ImageBlock;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
use Lattice\Form\RichContent;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Image;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;

#[AsBlock('workbench.hero', label: 'Hero', icon: Icon::LayoutTemplate, category: BlockCategory::Layout, description: 'Headline, intro, call to action and image.', keywords: ['header', 'banner', 'intro'])]
final class HeroBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            TextInput::make('title', __('workbench.blocks.hero.title'))->required()->rules(['max:90']),
            RichEditor::make('intro', __('workbench.blocks.hero.intro')),
            TextInput::make('button_label', __('workbench.blocks.hero.button-label')),
            Select::make('button_target', __('workbench.blocks.hero.button-target'))->options([
                '/demo' => 'Demo',
                '/products' => 'Products',
                '/pages' => 'Pages',
            ]),
            MediaPicker::make('image', __('workbench.blocks.hero.image'))->category('image'),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Stack
    {
        $title = $data->string('title')->toString();
        $intro = $data->document('intro');
        $label = $data->string('button_label')->toString();
        $media = ImageBlock::media($data->get('image'));

        return Stack::make()->gap(Gap::Medium)->schema(array_values(array_filter([
            Heading::make($title === '' ? __('workbench.blocks.hero.placeholder') : $title, 1),
            $intro === null ? null : RawBlock::make()->html('<div class="lt-blocks-prose text-lg text-lt-muted-fg">'.RichContent::make($intro)->toHtml().'</div>'),
            $label === '' ? null : Button::make($label)->href($data->string('button_target')->toString() ?: '#'),
            $media?->url() === null ? null : Image::make($media->url())->previewable(false),
        ])));
    }
}
