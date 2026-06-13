<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Validates a single FileUpload item, which is either a freshly uploaded file
 * (multipart `UploadedFile`), a freshly signed temp key, or a retained stored
 * path string. New uploads are checked against the field's type/size config;
 * string references must resolve to an object that exists on the disk.
 */
final readonly class FileUploadItem implements ValidationRule
{
    /**
     * @param  list<string>|null  $acceptedTypes
     */
    public function __construct(
        private bool $image,
        private ?array $acceptedTypes,
        private ?int $maxSizeKb,
        private string $disk,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value instanceof UploadedFile) {
            $this->validateUpload($value, $fail);

            return;
        }

        if (is_string($value) && $value !== '') {
            $this->validateReference($value, $fail);

            return;
        }

        $fail('The :attribute is not a valid file.');
    }

    private function validateUpload(UploadedFile $file, Closure $fail): void
    {
        if (! $file->isValid()) {
            $fail('The :attribute is not a valid file.');

            return;
        }

        $mime = (string) $file->getMimeType();

        if ($this->image && ! str_starts_with($mime, 'image/')) {
            $fail('The :attribute must be an image.');
        }

        if ($this->acceptedTypes !== null && ! $this->mimeAccepted($mime)) {
            $fail('The :attribute has an unsupported file type.');
        }

        if ($this->maxSizeKb !== null && $file->getSize() > $this->maxSizeKb * 1024) {
            $fail('The :attribute is too large.');
        }
    }

    private function validateReference(string $value, Closure $fail): void
    {
        if (! Storage::disk($this->disk)->exists($value)) {
            $fail('The :attribute upload could not be found.');
        }
    }

    private function mimeAccepted(string $mime): bool
    {
        foreach ($this->acceptedTypes ?? [] as $accepted) {
            if (str_ends_with($accepted, '/*') && str_starts_with($mime, rtrim($accepted, '*'))) {
                return true;
            }

            if ($accepted === $mime) {
                return true;
            }
        }

        return false;
    }
}
