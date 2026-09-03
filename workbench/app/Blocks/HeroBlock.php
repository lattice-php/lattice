<?php
declare(strict_types=1);

namespace Workbench\App\Blocks;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Builtin\ImageBlock;
use Lattice\Blocks\Components\RichText;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
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
            TextInput::make('title', __('workbench.blocks.hero.title'))->required()->rules(['max:90'])->placeholder(__('workbench.blocks.hero.placeholder')),
            RichEditor::make('intro', __('workbench.blocks.hero.intro'))->placeholder(__('workbench.blocks.hero.intro-placeholder')),
            TextInput::make('button_label', __('workbench.blocks.hero.button-label'))->placeholder(__('workbench.blocks.hero.button-placeholder')),
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
        $label = $data->string('button_label')->toString();
        $media = ImageBlock::media($data->get('image'));
        $editing = $data->editing();

        $image = match (true) {
            $media?->url() !== null => Image::make($media->url())->previewable(false)->bind('image'),
            $editing => RawBlock::make()->html(ImageBlock::placeholder(__('blocks::blocks.placeholders.image')))->bind('image'),
            default => null,
        };

        return Stack::make()->gap(Gap::Medium)->schema(array_values(array_filter([
            Heading::make($title === '' && $editing ? __('workbench.blocks.hero.placeholder') : $title, 1)->bind('title'),
            RichText::make($data->document('intro'), __('workbench.blocks.hero.intro-placeholder'))->class('text-lg text-lt-muted-fg')->bind('intro'),
            $label === '' && ! $editing
                ? null
                : Button::make($label === '' ? __('workbench.blocks.hero.button-placeholder') : $label)
                    ->href($data->string('button_target')->toString() ?: '#')
                    ->bind('button_label'),
            $image,
        ])));
    }

    public function html(BlockData $data, BlockSlots $slots): View
    {
        return view('workbench::blocks.hero', [
            'title' => $data->string('title')->toString(),
            'intro' => RichText::toHtml($data->document('intro')),
            'buttonLabel' => $data->string('button_label')->toString(),
            'buttonTarget' => $data->string('button_target')->toString() ?: '#',
            'imageSrc' => ImageBlock::media($data->get('image'))?->url(),
        ]);
    }
}
