<?php
declare(strict_types=1);

namespace Lattice\Media\Jobs;

use Closure;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Image\Image;
use Illuminate\Image\ImageException;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Image as Images;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Models\Media;
use RuntimeException;
use Throwable;

final class GenerateMediaConversions implements ShouldQueue
{
    use Queueable;

    /** The overlap middleware releases the job, and a release costs an attempt. */
    public int $tries = 3;

    public function __construct(
        public Media $media,
        public ?Model $attachable = null,
        public ?string $collection = null,
    ) {
        // `syncMedia()` runs inside the transaction that created the parent, and
        // `SerializesModels` would restore the attachable from a row a worker
        // cannot see yet. The trait declares the property, so set it fluently.
        $this->afterCommit();

        $queue = config('media.queue');

        if (is_string($queue) && $queue !== '') {
            $this->onQueue($queue);
        }
    }

    /**
     * @return array<int, WithoutOverlapping>
     */
    public function middleware(): array
    {
        return [
            new WithoutOverlapping((string) $this->media->getKey())
                ->releaseAfter(30)
                ->expireAfter(300),
        ];
    }

    public function handle(): void
    {
        if (! $this->media->isProbeable()) {
            return;
        }

        $generated = $this->withBackfilledSizes($this->media->conversions());
        $missing = array_diff_key($this->conversions(), $generated);

        // Nothing to generate still leaves the dimensions to record: a media
        // converted before this column existed, or one whose conversions were
        // all renamed away, only learns its size from the probe below. Byte
        // sizes are cheaper — a map recorded before they existed learns them
        // from disk stats alone, without ever reading the source.
        if ($missing === [] && $this->media->width !== null) {
            if ($generated !== $this->media->conversions()) {
                $this->media->mergeMeta(['conversions' => $generated]);
            }

            return;
        }

        $bytes = Storage::disk($this->media->disk)->get($this->media->path);

        if ($bytes === null) {
            Log::warning('Media conversions skipped: the source file is gone.', [
                'media' => $this->media->getKey(),
                'path' => $this->media->path,
            ]);

            return;
        }

        $size = @getimagesizefromstring($bytes);

        if ($size === false || ! Media::isConvertibleMime($size['mime'])) {
            Log::warning('Media conversions skipped: the source is not a convertible image.', [
                'media' => $this->media->getKey(),
                'path' => $this->media->path,
                'probed_mime' => $size === false ? null : $size['mime'],
            ]);

            return;
        }

        [$width, $height] = $size;

        if (! $this->fitsInMemory($width, $height)) {
            Log::warning('Media conversions skipped: not enough memory to decode the source.', [
                'media' => $this->media->getKey(),
                'dimensions' => [$width, $height],
            ]);

            return;
        }

        try {
            foreach ($missing as $name => $conversion) {
                $generated[$name] = $this->generate($name, $conversion, $bytes);
            }
        } catch (ImageException $exception) {
            // A source the driver cannot decode will not decode on a retry
            // either, and every derivative already written stays recorded.
            Log::warning('Media conversions stopped: the driver could not process the source.', [
                'media' => $this->media->getKey(),
                'reason' => $exception->getMessage(),
            ]);
        } finally {
            $this->media->mergeMeta([
                'conversions' => $generated,
                'width' => $width,
                'height' => $height,
            ]);
        }
    }

    /**
     * An `Image` carries its own transformation pipeline, so each conversion
     * gets a fresh instance over the same bytes rather than a shared one.
     *
     * @param  Closure(Image): mixed  $conversion  what the consumer promises is only checked at runtime
     * @return array{path: string, width: int, height: int, size: int}
     */
    private function generate(string $name, Closure $conversion, string $bytes): array
    {
        $image = $conversion(Images::fromBytes($bytes));

        if (! $image instanceof Image) {
            throw new RuntimeException("The [{$name}] media conversion must return an ".Image::class.' instance.');
        }

        $path = $this->derivativePath($name, $image->extension());

        if ($image->storeAs($path, null, $this->media->disk) === false) {
            throw new RuntimeException("Storing the [{$name}] media conversion at [{$path}] failed.");
        }

        return [
            'path' => $path,
            'width' => $image->width(),
            'height' => $image->height(),
            'size' => Storage::disk($this->media->disk)->size($path),
        ];
    }

    /**
     * @param  array<string, array{path: string, width: int, height: int, size?: int}>  $generated
     * @return array<string, array{path: string, width: int, height: int, size?: int}>
     */
    private function withBackfilledSizes(array $generated): array
    {
        foreach ($generated as $name => $conversion) {
            if (isset($conversion['size'])) {
                continue;
            }

            try {
                $generated[$name]['size'] = Storage::disk($this->media->disk)->size($conversion['path']);
            } catch (Throwable) {
                // A derivative gone from the disk keeps its entry size-less; --force rebuilds it.
            }
        }

        return $generated;
    }

    /**
     * The defaults plus the collection's extras. An attachable that does not
     * use `HasMedia` simply contributes nothing.
     *
     * @return array<string, Closure(Image): Image>
     */
    private function conversions(): array
    {
        $conversions = $this->media->defaultConversions();

        if (! $this->attachable instanceof Model || ! method_exists($this->attachable, 'mediaConversions')) {
            return $conversions;
        }

        /** @var array<array-key, string|Closure(Image): Image> $extra */
        $extra = $this->attachable->mediaConversions($this->collection ?? 'default');

        foreach ($extra as $name => $conversion) {
            if (is_string($conversion)) {
                if (! isset($conversions[$conversion])) {
                    throw new RuntimeException("The [{$conversion}] media conversion is not defined on ".$this->media::class.'.');
                }

                continue;
            }

            if (! is_string($name)) {
                throw new RuntimeException('A media conversion closure must be keyed by its conversion name.');
            }

            $conversions[$name] = $conversion;
        }

        return $conversions;
    }

    private function derivativePath(string $name, string $extension): string
    {
        $directory = dirname($this->media->path);
        $file = pathinfo($this->media->path, PATHINFO_FILENAME)."-{$name}.{$extension}";

        return ($directory === '.' ? '' : "{$directory}/")."conversions/{$file}";
    }

    /**
     * A decoded bitmap costs roughly four bytes per pixel, and source plus
     * destination are resident at once alongside the encoded strings.
     */
    private function fitsInMemory(int $width, int $height): bool
    {
        $limit = ini_get('memory_limit');

        if ($limit === '' || $limit === '-1') {
            return true;
        }

        $bytes = (int) $limit * match (strtolower(substr($limit, -1))) {
            'g' => 1024 ** 3,
            'm' => 1024 ** 2,
            'k' => 1024,
            default => 1,
        };

        return $width * $height * 4 * 2 <= ($bytes - memory_get_usage(true)) * 0.8;
    }
}
