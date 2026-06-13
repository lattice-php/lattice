<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

#[Component('form.file-upload')]
class FileUpload extends Field
{
    public ?bool $multiple = null;

    public ?int $maxFiles = null;

    public ?int $maxSize = null;

    public bool $image = false;

    public bool $signed = false;

    public ?string $accept = null;

    /**
     * Existing files surfaced on edit as display descriptors.
     *
     * @var list<array{key: string, name: string, url: ?string, size: ?int}>|null
     */
    public ?array $files = null;

    protected ?string $disk = null;

    protected ?string $directory = null;

    protected ?string $visibility = null;

    /** @var list<string>|null */
    protected ?array $acceptedFileTypes = null;

    public function disk(string $disk): static
    {
        $this->disk = $disk;

        return $this;
    }

    public function directory(string $directory): static
    {
        $this->directory = $directory;

        return $this;
    }

    public function visibility(string $visibility): static
    {
        $this->visibility = $visibility;

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

    public function nestedRules(FormData $data, Request $request): array
    {
        if ($this->multiple !== true) {
            return [];
        }

        return ["{$this->name()}.*" => [$this->itemRule()]];
    }

    public function castValue(mixed $value): mixed
    {
        return $value;
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

        $disk = Storage::disk($this->resolveDisk());

        $this->files = array_map(static function (string $path) use ($disk): array {
            try {
                $url = $disk->url($path);
            } catch (\Throwable) {
                $url = null;
            }

            try {
                $size = $disk->size($path);
            } catch (\Throwable) {
                $size = null;
            }

            return [
                'key' => $path,
                'name' => basename($path),
                'url' => $url,
                'size' => $size,
            ];
        }, $paths);
    }

    private function itemRule(): FileUploadItem
    {
        return new FileUploadItem(
            image: $this->image,
            acceptedTypes: $this->acceptedFileTypes,
            maxSizeKb: $this->maxSize,
            disk: $this->resolveDisk(),
        );
    }
}
