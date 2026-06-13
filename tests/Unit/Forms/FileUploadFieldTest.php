<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

function fileData(): FormData
{
    return FormData::fromRequest(Request::create('/', 'POST'));
}

it('serializes its client props', function (): void {
    $field = FileUpload::make('document')->image()->maxSize(2048)->multiple()->maxFiles(3);

    $json = wire($field);

    expect($json['type'])->toBe('form.file-upload')
        ->and($json['props']['name'])->toBe('document')
        ->and($json['props']['multiple'])->toBeTrue()
        ->and($json['props']['maxFiles'])->toBe(3)
        ->and($json['props']['maxSize'])->toBe(2048)
        ->and($json['props']['image'])->toBeTrue()
        ->and($json['props']['accept'])->toBe('image/*')
        ->and($json['props']['signed'])->toBeFalse();
});

it('builds a single-item rule for multipart single upload', function (): void {
    $field = FileUpload::make('document')->acceptedFileTypes(['application/pdf'])->maxSize(100);

    $rules = $field->resolveRules(fileData(), Request::create('/', 'POST'));

    expect($rules)->toHaveCount(1)
        ->and($rules[0])->toBeInstanceOf(FileUploadItem::class)
        ->and($field->nestedRules(fileData(), Request::create('/', 'POST')))->toBe([]);
});

it('builds array + per-item rules for multiple upload', function (): void {
    $field = FileUpload::make('docs')->multiple()->maxFiles(2);
    $req = Request::create('/', 'POST');

    expect($field->resolveRules(fileData(), $req))->toBe(['array', 'max:2'])
        ->and($field->nestedRules(fileData(), $req))->toHaveKey('docs.*');
});

it('passes the validated value through castValue unchanged', function (): void {
    $field = FileUpload::make('document');
    $file = UploadedFile::fake()->create('a.pdf', 1);

    expect($field->castValue($file))->toBe($file);
});

it('builds file descriptors from a stored path on prefill', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/a.pdf', 'data');

    $field = FileUpload::make('document');
    $field->prefill('uploads/a.pdf');

    expect($field->files)->toHaveCount(1)
        ->and($field->files[0]['key'])->toBe('uploads/a.pdf')
        ->and($field->files[0]['name'])->toBe('a.pdf');
});

it('builds descriptors for each stored path when multiple', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/a.pdf', 'x');
    Storage::disk('public')->put('uploads/b.pdf', 'y');

    $field = FileUpload::make('docs')->multiple();
    $field->prefill(['uploads/a.pdf', 'uploads/b.pdf']);

    expect($field->files)->toHaveCount(2);
});

it('signs an upload returning key url headers and method', function (): void {
    $fake = Storage::fake('s3');
    $fake->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []) => ['url' => "https://s3.test/{$path}", 'headers' => ['x-test' => '1']],
    );

    $field = FileUpload::make('document')->disk('s3')->signedUpload();
    $result = $field->signUpload(Request::create('/', 'POST', ['filename' => 'invoice.pdf']));

    expect($result['method'])->toBe('PUT')
        ->and($result['headers'])->toBe(['x-test' => '1'])
        ->and($result['key'])->toStartWith('tmp/')
        ->and($result['key'])->toEndWith('.pdf')
        ->and($result['url'])->toBe("https://s3.test/{$result['key']}");
});
