<?php
declare(strict_types=1);

namespace Lattice\Blocks\Builtin;

use Illuminate\Contracts\View\View;
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
use Lattice\Ui\Components\Stack;
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
        $images = $this->images($data);

        if ($images === []) {
            return $data->editing()
                ? RawBlock::make()->html(ImageBlock::placeholder(__('blocks::blocks.placeholders.gallery')))
                : Stack::make();
        }

        return Grid::make()->columns($this->columns($data))->schema(array_map(
            static fn (array $image): Image => Image::make($image['src'])->alt($image['alt'] ?: null)->previewable(false),
            $images,
        ));
    }

    public function html(BlockData $data, BlockSlots $slots): View|string
    {
        $images = $this->images($data);

        return $images === [] ? '' : view('blocks::blocks.gallery', [
            'images' => $images,
            'columns' => $this->columns($data),
        ]);
    }

    /**
     * @return list<array{src: string, alt: string}>
     */
    private function images(BlockData $data): array
    {
        $ids = array_values(array_filter(array_map(
            static fn (mixed $item): mixed => is_array($item) ? ($item['id'] ?? null) : $item,
            is_array($data->get('images')) ? $data->get('images') : [],
        ), is_numeric(...)));

        if ($ids === []) {
            return [];
        }

        $media = Media::query()->findMany(array_map(intval(...), $ids))->keyBy(static fn (Media $item): int => (int) $item->getKey());
        $images = [];

        foreach ($ids as $id) {
            $item = $media->get((int) $id);
            $url = $item?->url();

            if ($url !== null) {
                $images[] = ['src' => (string) $url, 'alt' => (string) ($item->alt ?? '')];
            }
        }

        return $images;
    }

    private function columns(BlockData $data): int
    {
        return max(2, min(4, (int) ($data->get('columns') ?: 3)));
    }
}
