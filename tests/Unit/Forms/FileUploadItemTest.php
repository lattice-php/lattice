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

it('accepts a valid multipart upload within size and type', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: ['application/pdf'], maxSizeKb: 100, disk: 's3', signed: false, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('a.pdf', 50, 'application/pdf')))->toBeFalse();
});

it('rejects a multipart upload that is too large', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: 10, disk: 's3', signed: false, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('big.pdf', 999)))->toBeTrue();
});

it('rejects a multipart non-image when image is required', function (): void {
    $rule = new FileUploadItem(image: true, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: false, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')))->toBeTrue();
});

it('rejects a string value in multipart mode (tamper)', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/abc.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: false, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/abc.pdf'))->toBeTrue();
});

it('accepts a signed tmp key that exists on disk', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/abc.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/abc.pdf'))->toBeFalse();
});

it('rejects a missing signed tmp key', function (): void {
    Storage::fake('s3');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/missing.pdf'))->toBeTrue();
});

it('rejects a signed key outside the temp prefix even if it exists (tamper)', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('uploads/secret.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'uploads/secret.pdf'))->toBeTrue();
});

it('rejects a signed key that exceeds the max size', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/big.bin', str_repeat('a', 11 * 1024));
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: 10, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/big.bin'))->toBeTrue();
});

it('accepts a signed key within the max size', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/small.bin', str_repeat('a', 5 * 1024));
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: 10, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/small.bin'))->toBeFalse();
});

it('rejects a signed non-image when image is required', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/doc.txt', str_repeat('a', 10));
    $rule = new FileUploadItem(image: true, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/doc.txt'))->toBeTrue();
});

it('accepts a signed image when image is required', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/pic.jpg', str_repeat('a', 10));
    $rule = new FileUploadItem(image: true, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/pic.jpg'))->toBeFalse();
});

it('rejects a signed key with an unaccepted mime type', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/doc.txt', str_repeat('a', 10));
    $rule = new FileUploadItem(image: false, acceptedTypes: ['application/pdf'], maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, 'tmp/doc.txt'))->toBeTrue();
});

it('rejects an UploadedFile in signed mode (tamper)', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, UploadedFile::fake()->create('a.pdf', 1, 'application/pdf')))->toBeTrue();
});

it('passes for an empty string', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: false, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, ''))->toBeFalse();
});

it('passes for a null value', function (): void {
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');

    expect(fileRuleFails($rule, null))->toBeFalse();
});
