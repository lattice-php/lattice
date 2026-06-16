<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\Rules\FileUploadItem;
use RuntimeException;
use Throwable;

#[AsField(FieldType::FileUpload)]
class FileUpload extends Field
{
    public bool $multiple = false;

    public ?int $maxFiles = null;

    public ?int $maxSize = null;

    public bool $image = false;

    public bool $signed = false;

    public ?string $accept = null;

    /**
     * Existing files surfaced on edit as display descriptors.
     *
     * @var list<array{key: string, name: string, url: ?string, size: ?int, token: string}>|null
     */
    public ?array $files = null;

    protected ?string $disk = null;

    /** @var list<string>|null */
    protected ?array $acceptedFileTypes = null;

    public function disk(string $disk): static
    {
        $this->disk = $disk;

        return $this;
    }

    /**
     * @param  list<string>  $types
     */
    public function acceptedFileTypes(array $types): static
    {
        $this->acceptedFileTypes = $types;
        $this->accept = implode(',', $this->acceptedFileTypes);

        return $this;
    }

    public function image(bool $image = true): static
    {
        $this->image = $image;

        if ($image && $this->accept === null) {
            $this->accept = 'image/*';
        }

        return $this;
    }

    public function maxSize(int $kilobytes): static
    {
        $this->maxSize = $kilobytes;

        return $this;
    }

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function maxFiles(int $maxFiles): static
    {
        $this->maxFiles = $maxFiles;

        return $this;
    }

    public function signedUpload(bool $signed = true): static
    {
        $this->signed = $signed;

        return $this;
    }

    public function usesSignedUpload(): bool
    {
        return $this->signed;
    }

    public function resolveDisk(): string
    {
        return $this->disk ?? (string) config('lattice.files.disk', 'public');
    }

    public function tempPrefix(): string
    {
        return (string) config('lattice.files.temp_prefix', 'tmp');
    }

    /**
     * @return array{key: string, url: string, headers: array<string, mixed>, method: string}
     */
    public function signUpload(Request $request): array
    {
        $filename = $request->string('filename')->toString();
        $extension = pathinfo($filename, PATHINFO_EXTENSION);

        $key = rtrim($this->tempPrefix(), '/').'/'.Str::uuid()->toString()
            .($extension !== '' ? '.'.$extension : '');

        $ttl = (int) config('lattice.files.url_ttl', 5);

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->resolveDisk());
        $signed = $disk->temporaryUploadUrl($key, now()->addMinutes($ttl));

        return [
            'key' => $key,
            'url' => $signed['url'],
            'headers' => $signed['headers'],
            'method' => 'PUT',
        ];
    }

    /**
     * @param  iterable<int, string>  $keys
     * @param  Closure(string, array{extension: string, mime_type: ?string, size: ?int}): string  $destinationUsing
     * @return list<array{disk: string, path: string, name: string, mime_type: ?string, size: ?int}>
     */
    public function finalizeSignedUploads(iterable $keys, Closure $destinationUsing): array
    {
        if (! $this->usesSignedUpload()) {
            throw new RuntimeException('Only signed uploads can be finalized.');
        }

        $diskName = $this->resolveDisk();

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($diskName);
        $finalized = [];

        foreach ($keys as $key) {
            $this->ensureFinalizableKey($disk, $key);

            $mimeType = self::fileMimeType($disk, $key);
            $size = self::fileSize($disk, $key);
            $extension = pathinfo($key, PATHINFO_EXTENSION);
            $path = $destinationUsing($key, [
                'extension' => $extension,
                'mime_type' => $mimeType,
                'size' => $size,
            ]);

            if ($path === '' || str_starts_with($path, rtrim($this->tempPrefix(), '/').'/')) {
                throw new InvalidArgumentException('Signed uploads must be finalized outside the temporary upload prefix.');
            }

            if (! $disk->move($key, $path)) {
                throw new RuntimeException("Unable to finalize signed upload [{$key}].");
            }

            $finalized[] = [
                'disk' => $diskName,
                'path' => $path,
                'name' => basename($path),
                'mime_type' => $mimeType,
                'size' => $size,
            ];
        }

        return $finalized;
    }

    #[\Override]
    public function resolveRules(FormData $data, Request $request): array
    {
        $userRules = parent::resolveRules($data, $request);

        if ($this->multiple === true) {
            $rules = ['array'];

            if ($this->maxFiles !== null) {
                $rules[] = "max:{$this->maxFiles}";
            }

            return [...$rules, ...$userRules];
        }

        return [$this->itemRule(), ...$userRules];
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        if ($this->multiple !== true) {
            return [];
        }

        return ["{$this->name()}.*" => [$this->itemRule()]];
    }

    public function prefill(mixed $value): void
    {
        $paths = array_values(array_filter(
            is_array($value) ? $value : [$value],
            static fn (mixed $item): bool => is_string($item) && $item !== '',
        ));

        if ($paths === []) {
            return;
        }

        $diskName = $this->resolveDisk();
        $disk = Storage::disk($diskName);
        $name = $this->name();
        $signer = app(SignsComponentReferences::class);

        $this->files = array_map(static fn (string $path): array => [
            'key' => $path,
            'name' => basename($path),
            'url' => self::fileUrl($disk, $path),
            'size' => self::fileSize($disk, $path),
            'token' => $signer->seal('file', $name, ['disk' => $diskName, 'path' => $path]),
        ], $paths);
    }

    /**
     * Resolve the existing-file removals submitted for this field into trusted
     * disk paths. Reads the sealed `{name}__removed[]` tokens, unseals each
     * (skipping any forged/expired/mismatched token), and returns their paths.
     *
     * @return list<string>
     */
    public static function removed(Request $request, string $name): array
    {
        $tokens = $request->input("{$name}__removed", []);

        if (! is_array($tokens)) {
            return [];
        }

        $signer = app(SignsComponentReferences::class);
        $paths = [];

        foreach ($tokens as $token) {
            if (! is_string($token)) {
                continue;
            }

            $context = $signer->unseal($token, 'file', $name);

            if (is_array($context) && isset($context['path']) && is_string($context['path'])) {
                $paths[] = $context['path'];
            }
        }

        return array_values(array_unique($paths));
    }

    private function itemRule(): FileUploadItem
    {
        return new FileUploadItem(
            image: $this->image,
            acceptedTypes: $this->acceptedFileTypes,
            maxSizeKb: $this->maxSize,
            disk: $this->resolveDisk(),
            signed: $this->signed,
            tempPrefix: $this->tempPrefix(),
        );
    }

    private function ensureFinalizableKey(FilesystemAdapter $disk, string $key): void
    {
        if (! str_starts_with($key, rtrim($this->tempPrefix(), '/').'/')) {
            throw new InvalidArgumentException("Signed upload [{$key}] is outside the temporary upload prefix.");
        }

        if (! $disk->exists($key)) {
            throw new InvalidArgumentException("Signed upload [{$key}] does not exist.");
        }
    }

    private static function fileUrl(FilesystemAdapter $disk, string $path): ?string
    {
        try {
            return $disk->temporaryUrl($path, now()->addMinutes((int) config('lattice.files.url_ttl', 5)));
        } catch (Throwable) {
            try {
                return $disk->url($path);
            } catch (Throwable) {
                return null;
            }
        }
    }

    private static function fileMimeType(FilesystemAdapter $disk, string $path): ?string
    {
        try {
            $mimeType = $disk->mimeType($path);

            return is_string($mimeType) && $mimeType !== '' ? $mimeType : null;
        } catch (Throwable) {
            return null;
        }
    }

    private static function fileSize(FilesystemAdapter $disk, string $path): ?int
    {
        try {
            return $disk->size($path);
        } catch (Throwable) {
            return null;
        }
    }
}
