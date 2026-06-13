<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Validates a single FileUpload item. In multipart mode (`signed=false`) a
 * submitted value must be a freshly uploaded `UploadedFile`; in signed mode
 * (`signed=true`) it must be a temp key under the field's temp prefix that
 * exists on the disk. Anything else (a string in multipart mode, an
 * `UploadedFile` in signed mode, an out-of-prefix key) is a tamper attempt and
 * is rejected. Existing files on edit are display-only and are never
 * resubmitted as field values.
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
        private bool $signed,
        private string $tempPrefix,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if ($value instanceof UploadedFile) {
            if ($this->signed) {
                $fail('The :attribute is not a valid upload.');

                return;
            }

            $this->validateUpload($value, $fail);

            return;
        }

        if (is_string($value)) {
            if (! $this->signed) {
                $fail('The :attribute is not a valid file.');

                return;
            }

            $this->validateSignedKey($value, $fail);

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

    private function validateSignedKey(string $key, Closure $fail): void
    {
        if (! str_starts_with($key, rtrim($this->tempPrefix, '/').'/')) {
            $fail('The :attribute upload could not be found.');

            return;
        }

        if (! Storage::disk($this->disk)->exists($key)) {
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
