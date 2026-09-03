<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Core\Enums\ColorName;
use Lattice\Form\Components\TextInput;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Media\Models\Media;
use Lattice\Ui\Components\Image;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\Enums\Size;

#[AsBlock('lattice.image', label: 'Image', icon: Icon::Image, category: BlockCategory::Media, description: 'A single image with an optional caption.', keywords: ['photo', 'picture', 'media'])]
final class ImageBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            MediaPicker::make('image', __('blocks::blocks.fields.image'))->category('image'),
            TextInput::make('alt', __('blocks::blocks.fields.alt')),
            TextInput::make('caption', __('blocks::blocks.fields.caption'))->placeholder(__('blocks::blocks.placeholders.caption')),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Stack
    {
        $media = self::media($data->get('image'));
        $caption = $data->string('caption')->toString();
        $editing = $data->editing();

        $image = match (true) {
            $media?->url() !== null => Image::make($media->url())->alt($data->string('alt')->toString() ?: null)->previewable(false)->bind('image'),
            $editing => RawBlock::make()->html(self::placeholder(__('blocks::blocks.placeholders.image')))->bind('image'),
            default => null,
        };

        return Stack::make()->gap(Gap::Small)->schema(array_values(array_filter([
            $image,
            $caption === '' && ! $editing ? null : Text::make($caption)->size(Size::Sm)->color(ColorName::Muted)->bind('caption'),
        ])));
    }

    public function html(BlockData $data, BlockSlots $slots): View|string
    {
        $media = self::media($data->get('image'));
        $src = $media?->url();

        return $src === null ? '' : view('blocks::blocks.image', [
            'src' => $src,
            'alt' => $data->string('alt')->toString(),
            'caption' => $data->string('caption')->toString(),
        ]);
    }

    public static function media(mixed $value): ?Media
    {
        $id = is_array($value) ? ($value['id'] ?? null) : $value;

        return is_numeric($id) ? Media::query()->find((int) $id) : null;
    }

    public static function placeholder(string $label): string
    {
        return '<div class="flex h-40 items-center justify-center rounded-lt border border-dashed border-lt-border bg-lt-muted text-sm text-lt-muted-fg">'.e($label).'</div>';
    }
}
