<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

function runRule(FileUploadItem $rule, mixed $value): array
{
    $failures = [];
    $rule->validate('document', $value, function (string $message) use (&$failures): void {
        $failures[] = $message;
    });

    return $failures;
}

it('accepts a valid uploaded file within size and type', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: ['application/pdf'], maxSizeKb: 100, disk: 's3');

    expect(runRule($rule, UploadedFile::fake()->create('a.pdf', 50, 'application/pdf')))->toBe([]);
});

it('rejects an uploaded file that is too large', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: 10, disk: 's3');

    expect(runRule($rule, UploadedFile::fake()->create('big.pdf', 999)))->not->toBe([]);
});

it('rejects a non-image when image is required', function (): void {
    $rule = new FileUploadItem(image: true, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(runRule($rule, UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')))->not->toBe([]);
});

it('accepts an existing signed tmp key that exists on disk', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/abc.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(runRule($rule, 'tmp/abc.pdf'))->toBe([]);
});

it('rejects a missing signed key', function (): void {
    Storage::fake('s3');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(runRule($rule, 'tmp/missing.pdf'))->not->toBe([]);
});

it('rejects a string outside the temp prefix that does not exist', function (): void {
    Storage::fake('s3');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(runRule($rule, 'uploads/evil.pdf'))->not->toBe([]);
});
