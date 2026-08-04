<?php
declare(strict_types=1);

namespace Lattice\Media\Models\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Image\Image;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Attachment;
use Lattice\Media\Models\Media;

trait HasMedia
{
    /**
     * @return MorphToMany<Media, $this, Attachment>
     */
    public function media(string $collection = 'default'): MorphToMany
    {
        return $this->morphToMany(Media::modelClass(), 'attachable', 'media_attachments', null, 'media_id')
            ->using(Attachment::class)
            ->withPivot(['id', 'collection', 'sort_order', 'meta'])
            ->withTimestamps()
            ->wherePivot('collection', $collection)
            ->orderByPivot('sort_order');
    }

    /**
     * Conversions this collection needs on top of the media's defaults.
     *
     * Override this hook on the consuming model. Keys are conversion names,
     * values are callbacks over an immutable `Image` that must return the
     * transformed image. A bare string entry (`['thumb']`) reuses the
     * globally defined conversion of that name from the media's
     * `defaultConversions()`.
     *
     * Conversion names are a global namespace: one name is one spec
     * everywhere, so two collections that need different sizes must ask for
     * different names.
     *
     * @return array<array-key, string|Closure(Image): Image>
     */
    public function mediaConversions(string $collection): array
    {
        return [];
    }

    /**
     * Accepts plain media ids or picker rows: an array entry must carry an
     * `id` key and every other key is written into the attachment's meta.
     *
     * @param  array<int, int|string|array<string, mixed>>  $media
     */
    public function syncMedia(array $media, string $collection = 'default'): void
    {
        $sync = [];

        foreach (array_values($media) as $index => $entry) {
            $row = is_array($entry) ? $entry : ['id' => $entry];
            $meta = array_diff_key($row, ['id' => true]);

            $sync[(int) $row['id']] = [
                'collection' => $collection,
                'sort_order' => $index + 1,
                'meta' => $meta === [] ? null : $meta,
            ];
        }

        $attached = $this->media($collection)->sync($sync)['attached'];

        foreach (Media::modelQuery()->findMany($attached) as $mediaModel) {
            GenerateMediaConversions::dispatch($mediaModel, $this, $collection);
        }
    }

    /**
     * The stored attachments as picker rows (`[{id, ...meta}]`) for form prefill.
     *
     * @return list<array<string, mixed>>
     */
    public function mediaPickerValue(string $collection = 'default'): array
    {
        return $this->media($collection)->get()
            ->map(function (Media $media): array {
                /** @var Attachment $attachment */
                $attachment = $media->pivot;

                return ['id' => (int) $media->getKey(), ...($attachment->meta ?? [])];
            })
            ->all();
    }

    public function firstMediaUrl(string $collection = 'default'): ?string
    {
        return $this->media($collection)->first()?->url();
    }
}
