<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\BlockData;
use Lattice\Blocks\BlockDefinition;
use Lattice\Blocks\BlockSlots;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Form\Components\Select;
use Lattice\Media\Forms\Components\MediaPicker;
use Lattice\Media\Models\Media;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Components\Image;
use Lattice\Ui\Components\RawBlock;
use Lattice\Ui\Enums\Icon;

#[AsBlock('lattice.gallery', label: 'Gallery', icon: Icon::Images, category: BlockCategory::Media, description: 'A grid of images.', keywords: ['photos', 'grid', 'media'])]
final class GalleryBlock extends BlockDefinition
{
    public function fields(): array
    {
        return [
            MediaPicker::make('images', __('blocks::blocks.fields.images'))->multiple()->category('image'),
            Select::make('columns', __('blocks::blocks.fields.columns'))->options(['2' => '2', '3' => '3', '4' => '4'])->value('3'),
        ];
    }

    public function render(BlockData $data, BlockSlots $slots): Component
    {
        $ids = array_values(array_filter(array_map(
            static fn (mixed $item): mixed => is_array($item) ? ($item['id'] ?? null) : $item,
            is_array($data->get('images')) ? $data->get('images') : [],
        ), is_numeric(...)));

        if ($ids === []) {
            return RawBlock::make()->html(ImageBlock::placeholder(__('blocks::blocks.placeholders.gallery')));
        }

        $media = Media::query()->findMany(array_map(intval(...), $ids))->keyBy(static fn (Media $item): int => (int) $item->getKey());
        $images = [];

        foreach ($ids as $id) {
            $item = $media->get((int) $id);

            if ($item?->url() !== null) {
                $images[] = Image::make((string) $item->url())->previewable(false);
            }
        }

        return Grid::make()->columns(max(2, min(4, (int) ($data->get('columns') ?: 3))))->schema($images);
    }
}
