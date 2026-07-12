<?php
declare(strict_types=1);

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

function fileData(): FormData
{
    return FormData::fromRequest(Request::create('/', 'POST'));
}

function fileUploadDisk(
    bool $exists = true,
    bool $moves = true,
    ?string $mimeType = 'image/jpeg',
    ?int $size = 10,
    bool $throwsMetadata = false,
    bool $throwsUrls = false,
): FilesystemAdapter {
    return new class($exists, $moves, $mimeType, $size, $throwsMetadata, $throwsUrls) extends FilesystemAdapter
    {
        public function __construct(
            private readonly bool $exists,
            private readonly bool $moves,
            private readonly ?string $mimeType,
            private readonly ?int $size,
            private readonly bool $throwsMetadata,
            private readonly bool $throwsUrls,
        ) {}

        public function exists(mixed $path): bool
        {
            return $this->exists;
        }

        public function mimeType(mixed $path): string|false
        {
            if ($this->throwsMetadata) {
                throw new RuntimeException('mime unavailable');
            }

            return $this->mimeType ?? false;
        }

        public function move(mixed $from, mixed $to): bool
        {
            return $this->moves;
        }

        public function size(mixed $path): int
        {
            if ($this->throwsMetadata) {
                throw new RuntimeException('size unavailable');
            }

            return $this->size ?? 0;
        }

        /**
         * @param  array<string, mixed>  $options
         */
        public function temporaryUrl(mixed $path, mixed $expiration, array $options = []): string
        {
            if ($this->throwsUrls) {
                throw new RuntimeException('temporary unavailable');
            }

            return "https://signed.test/{$path}";
        }

        public function url(mixed $path): string
        {
            if ($this->throwsUrls) {
                throw new RuntimeException('url unavailable');
            }

            return "https://storage.test/{$path}";
        }
    };
}

it('serializes its client props', function (): void {
    $field = FileUpload::make('document')->image()->maxSize(2048)->multiple()->maxFiles(3);

    $json = wire($field);

    expect($json['type'])->toBe('field.file-upload')
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
    $field->hydrateState('uploads/a.pdf');

    expect($field->files)->toHaveCount(1)
        ->and($field->files[0]['key'])->toBe('uploads/a.pdf')
        ->and($field->files[0]['name'])->toBe('a.pdf');
});

it('prefers temporary urls for prefilled files when the disk supports them', function (): void {
    $fake = Storage::fake('s3');
    $fake->buildTemporaryUrlsUsing(fn (string $path): string => "https://signed.test/{$path}");
    Storage::disk('s3')->put('uploads/a.pdf', 'data');

    $field = FileUpload::make('document')->disk('s3');
    $field->hydrateState('uploads/a.pdf');

    expect($field->files[0]['url'])->toBe('https://signed.test/uploads/a.pdf');
});

it('builds descriptors for each stored path when multiple', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/a.pdf', 'x');
    Storage::disk('public')->put('uploads/b.pdf', 'y');

    $field = FileUpload::make('docs')->multiple();
    $field->hydrateState(['uploads/a.pdf', 'uploads/b.pdf']);

    expect($field->files)->toHaveCount(2);
});

it('signs an upload returning key url headers and method', function (): void {
    $fake = Storage::fake('s3');
    $fake->buildTemporaryUploadUrlsUsing(
        fn (string $path, $expiration, array $options = []): array => ['url' => "https://s3.test/{$path}", 'headers' => ['x-test' => '1']],
    );

    $field = FileUpload::make('document')->disk('s3')->signedUpload();
    $result = $field->signUpload(Request::create('/', 'POST', ['filename' => 'invoice.pdf']));

    expect($result->method)->toBe(HttpMethod::Put)
        ->and($result->headers)->toBe(['x-test' => '1'])
        ->and($result->key)->toStartWith('tmp/')
        ->and($result->key)->toEndWith('.pdf')
        ->and($result->url)->toBe("https://s3.test/{$result->key}");
});

it('finalizes signed uploads on the configured disk', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/photo.jpg', 'image-data');

    $field = FileUpload::make('images')->disk('s3')->signedUpload();

    $uploads = $field->finalizeSignedUploads(
        ['tmp/photo.jpg'],
        fn (string $key, array $metadata): string => 'uploads/final.'.$metadata['extension'],
    );

    expect($uploads)->toHaveCount(1)
        ->and($uploads[0]['disk'])->toBe('s3')
        ->and($uploads[0]['path'])->toBe('uploads/final.jpg')
        ->and($uploads[0]['name'])->toBe('final.jpg')
        ->and($uploads[0]['mime_type'])->toBe('image/jpeg')
        ->and($uploads[0]['size'])->toBe(10);

    Storage::disk('s3')->assertMissing('tmp/photo.jpg');
    Storage::disk('s3')->assertExists('uploads/final.jpg');
});

it('rejects finalizing non-temporary signed upload keys', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('uploads/photo.jpg', 'image-data');

    $field = FileUpload::make('images')->disk('s3')->signedUpload();

    expect(fn (): array => $field->finalizeSignedUploads(
        ['uploads/photo.jpg'],
        fn (): string => 'uploads/final.jpg',
    ))->toThrow(InvalidArgumentException::class);
});

it('rejects finalizing uploads when signed uploads are disabled', function (): void {
    $field = FileUpload::make('images');

    expect(fn (): array => $field->finalizeSignedUploads(
        ['tmp/photo.jpg'],
        fn (): string => 'uploads/final.jpg',
    ))->toThrow(RuntimeException::class, 'Only signed uploads can be finalized.');
});

it('rejects finalizing signed upload keys that do not exist', function (): void {
    Storage::fake('s3');

    $field = FileUpload::make('images')->disk('s3')->signedUpload();

    expect(fn (): array => $field->finalizeSignedUploads(
        ['tmp/missing.jpg'],
        fn (): string => 'uploads/final.jpg',
    ))->toThrow(InvalidArgumentException::class, 'Signed upload [tmp/missing.jpg] does not exist.');
});

it('rejects destinations inside the temporary upload prefix', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/photo.jpg', 'image-data');

    $field = FileUpload::make('images')->disk('s3')->signedUpload();

    expect(fn (): array => $field->finalizeSignedUploads(
        ['tmp/photo.jpg'],
        fn (): string => 'tmp/final.jpg',
    ))->toThrow(InvalidArgumentException::class, 'Signed uploads must be finalized outside the temporary upload prefix.');
});

it('fails when the disk cannot move a finalized upload', function (): void {
    $disk = fileUploadDisk(moves: false);
    Storage::shouldReceive('disk')->with('s3')->once()->andReturn($disk);

    $field = FileUpload::make('images')->disk('s3')->signedUpload();

    expect(fn (): array => $field->finalizeSignedUploads(
        ['tmp/photo.jpg'],
        fn (): string => 'uploads/final.jpg',
    ))->toThrow(RuntimeException::class, 'Unable to finalize signed upload [tmp/photo.jpg].');
});

it('continues finalizing when stored file metadata cannot be read', function (): void {
    $disk = fileUploadDisk(throwsMetadata: true);
    Storage::shouldReceive('disk')->with('s3')->once()->andReturn($disk);

    $metadata = null;
    $field = FileUpload::make('images')->disk('s3')->signedUpload();
    $uploads = $field->finalizeSignedUploads(
        ['tmp/photo.jpg'],
        function (string $key, array $file) use (&$metadata): string {
            $metadata = $file;

            return 'uploads/final.'.$file['extension'];
        },
    );

    expect($metadata)->toBe([
        'extension' => 'jpg',
        'mime_type' => null,
        'size' => null,
    ])->and($uploads[0]['mime_type'])->toBeNull()
        ->and($uploads[0]['size'])->toBeNull()
        ->and($uploads[0]['path'])->toBe('uploads/final.jpg');
});

it('sets url and size to null when prefill metadata cannot be read', function (): void {
    $disk = fileUploadDisk(throwsMetadata: true, throwsUrls: true);
    Storage::shouldReceive('disk')->with('broken')->once()->andReturn($disk);

    $field = FileUpload::make('document')->disk('broken');
    $field->hydrateState('uploads/a.pdf');

    expect($field->files[0]['url'])->toBeNull()
        ->and($field->files[0]['size'])->toBeNull();
});

it('adds a sealed token to each prefilled file descriptor', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('uploads/a.pdf', 'data');

    $field = FileUpload::make('document');
    $field->hydrateState('uploads/a.pdf');

    expect($field->files[0])->toHaveKeys(['key', 'name', 'url', 'size', 'token'])
        ->and($field->files[0]['token'])->not->toBe('');
});

it('resolves removed tokens back to trusted paths', function (): void {
    $signer = app(SignsComponentReferences::class);
    $token = $signer->seal('file', 'document', ['disk' => 'public', 'path' => 'uploads/a.pdf']);
    $request = Request::create('/', 'POST', ['document__removed' => [$token]]);

    expect(FileUpload::removed($request, 'document'))->toBe(['uploads/a.pdf']);
});

it('ignores forged or mismatched removed tokens', function (): void {
    $signer = app(SignsComponentReferences::class);
    $wrongField = $signer->seal('file', 'avatar', ['disk' => 'public', 'path' => 'uploads/x.pdf']);
    $request = Request::create('/', 'POST', [
        'document__removed' => ['garbage-token', $wrongField],
    ]);

    expect(FileUpload::removed($request, 'document'))->toBe([]);
});

it('ignores non-array removed token payloads', function (): void {
    $request = Request::create('/', 'POST', ['document__removed' => 'sealed-token']);

    expect(FileUpload::removed($request, 'document'))->toBe([]);
});
