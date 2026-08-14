<?php
declare(strict_types=1);

namespace Lattice\Media\Models;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Image\Image;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Database\Factories\MediaFactory;
use Throwable;

/**
 * @property string $disk
 * @property string $path
 * @property string $name
 * @property string $mime_type
 * @property string|null $category
 * @property int $size
 * @property array{width?: int, height?: int, alt?: string, conversions?: array<string, array{path: string, width: int, height: int, size?: int}>}|null $meta
 * @property-read int|null $width
 * @property-read int|null $height
 * @property-read string|null $alt
 * @property int|null $uploaded_by
 * @property-read Attachment|null $pivot
 */
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    /** Mime types Intervention can decode: `image/svg+xml` is an image but not one of them. */
    private const array CONVERTIBLE_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/bmp',
        'image/gif',
        'image/webp',
    ];

    protected $table = 'media';

    protected $guarded = [];

    /** @var list<string> */
    protected $hidden = ['meta'];

    /** @var list<string> */
    protected $appends = ['width', 'height', 'alt'];

    /**
     * The configured model class: consumers subclass `Media` and point
     * `media.model` at their class to override the conversion defaults.
     * An FQCN that is not a `Media` degrades to this class.
     *
     * @return class-string<self>
     */
    public static function modelClass(): string
    {
        $class = config('media.model');

        return is_string($class) && is_a($class, self::class, true) ? $class : self::class;
    }

    /**
     * @return Builder<self>
     */
    public static function modelQuery(): Builder
    {
        $class = self::modelClass();

        return $class::query();
    }

    #[\Override]
    protected static function booted(): void
    {
        self::deleted(function (Media $media): void {
            $media->attachments()->delete();
            Storage::disk($media->disk)->delete([$media->path, ...$media->conversionPaths()]);
        });
    }

    /**
     * @return HasMany<Attachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'media_id');
    }

    /**
     * Derivatives generated for every convertible media, keyed by name.
     *
     * Callbacks receive an immutable `Image` and must return the transformed
     * image. Names are a global namespace: one name is one spec everywhere.
     *
     * @return array<string, Closure(Image): Image>
     */
    public function defaultConversions(): array
    {
        return [
            'thumb' => fn (Image $image): Image => $image->cover(400, 400)->optimize('webp', 70),
        ];
    }

    /** Falls back to the original whenever the conversion was never generated. */
    public function url(?string $conversion = null): ?string
    {
        $path = $conversion === null ? null : $this->conversionPath($conversion);

        return $this->pathUrl($path ?? $this->path);
    }

    /**
     * The conversion every preview surface renders: grid cards, picker chips, the detail panel.
     * A subclass that overrides `defaultConversions()` and drops `thumb` must override this too.
     */
    public function previewConversion(): string
    {
        return 'thumb';
    }

    /** The derivative every preview surface renders: grid cards, picker chips, the detail panel. */
    public function previewUrl(): ?string
    {
        return $this->url($this->previewConversion());
    }

    public function conversionPath(string $name): ?string
    {
        return $this->conversions()[$name]['path'] ?? null;
    }

    public function hasConversion(string $name): bool
    {
        return $this->conversionPath($name) !== null;
    }

    /**
     * The generated derivative map, keyed by conversion name. `size` (bytes)
     * is absent on entries recorded before it existed until the job backfills
     * them.
     *
     * @return array<string, array{path: string, width: int, height: int, size?: int}>
     */
    public function conversions(): array
    {
        return $this->meta['conversions'] ?? [];
    }

    /**
     * @return list<string>
     */
    public function conversionPaths(): array
    {
        return array_column($this->conversions(), 'path');
    }

    /**
     * Merges into the existing `meta` payload instead of replacing it: a
     * consumer may keep their own keys alongside the ones this package
     * writes, and every write must leave them untouched.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function mergeMeta(array $attributes): bool
    {
        return $this->update(['meta' => [...($this->meta ?? []), ...$attributes]]);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * The stored mime can be wrong — signed uploads derive it from the file
     * extension — so the probed mime of the actual bytes gets the same check.
     */
    public static function isConvertibleMime(string $mime): bool
    {
        return in_array($mime, self::CONVERTIBLE_MIME_TYPES, true);
    }

    public function isProbeable(): bool
    {
        return in_array($this->mime_type, self::probeableMimeTypes(), true);
    }

    /**
     * Worth reading from disk: everything the driver decodes, plus the generic
     * type a signed upload records when the disk cannot resolve the real one.
     * The job probes the bytes and skips whatever turns out not to be an image.
     *
     * @return list<string>
     */
    public static function probeableMimeTypes(): array
    {
        return [...self::CONVERTIBLE_MIME_TYPES, 'application/octet-stream'];
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(): array
    {
        return [
            ...parent::toArray(),
            'url' => $this->url(),
            'preview_url' => $this->previewUrl(),
        ];
    }

    /**
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    protected function getWidthAttribute(): ?int
    {
        return $this->meta['width'] ?? null;
    }

    protected function getHeightAttribute(): ?int
    {
        return $this->meta['height'] ?? null;
    }

    protected function getAltAttribute(): ?string
    {
        return $this->meta['alt'] ?? null;
    }

    protected static function newFactory(): MediaFactory
    {
        return MediaFactory::new();
    }

    private function pathUrl(string $path): ?string
    {
        $disk = Storage::disk($this->disk);

        try {
            return $disk->temporaryUrl($path, now()->addMinutes((int) config('lattice.files.url_ttl', 5)));
        } catch (Throwable) {
        }

        try {
            return $disk->url($path);
        } catch (Throwable) {
            return null;
        }
    }
}
