<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

function fileRuleFails(FileUploadItem $rule, mixed $value): bool
{
    return Validator::make(['document' => $value], ['document' => [$rule]])->fails();
}

it('accepts a valid uploaded file within size and type', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: ['application/pdf'], maxSizeKb: 100, disk: 's3');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('a.pdf', 50, 'application/pdf')))->toBeFalse();
});

it('rejects an uploaded file that is too large', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: 10, disk: 's3');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('big.pdf', 999)))->toBeTrue();
});

it('rejects a non-image when image is required', function (): void {
    $rule = new FileUploadItem(image: true, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')))->toBeTrue();
});

it('accepts an existing signed tmp key that exists on disk', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/abc.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(fileRuleFails($rule, 'tmp/abc.pdf'))->toBeFalse();
});

it('rejects a missing signed key', function (): void {
    Storage::fake('s3');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(fileRuleFails($rule, 'tmp/missing.pdf'))->toBeTrue();
});

it('rejects a string outside the temp prefix that does not exist', function (): void {
    Storage::fake('s3');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3');

    expect(fileRuleFails($rule, 'uploads/evil.pdf'))->toBeTrue();
});
