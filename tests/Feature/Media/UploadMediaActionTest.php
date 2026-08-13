<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;

beforeEach(function (): void {
    bootstrapMediaTest(actions: [UploadMediaAction::class]);
});

test('multipart uploads create media rows on the configured disk', function (): void {
    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('team.jpg', 100, 100)],
    ])->assertOk();

    $media = Media::query()->sole();

    expect($media->name)->toBe('team.jpg')
        ->and($media->disk)->toBe('public')
        ->and($media->mime_type)->toBe('image/jpeg')
        ->and($media->uploaded_by)->toBe(auth()->id())
        ->and(Storage::disk('public')->exists($media->path))->toBeTrue();
});

test('uploads outside the configured accepted types are rejected', function (): void {
    config()->set('media.accepted_types', ['image/*']);

    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->create('report.pdf', 10, 'application/pdf')],
    ])->assertStatus(422);

    expect(Media::query()->count())->toBe(0);

    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('team.jpg')],
    ])->assertOk();

    expect(Media::query()->count())->toBe(1);
});

test('signed temp keys are finalized out of the temp prefix', function (): void {
    config()->set('media.signed_uploads', true);
    Storage::disk('public')->put('tmp/abc123.jpg', 'bytes');

    $this->callAction(UploadMediaAction::class, ['files' => ['tmp/abc123.jpg']])
        ->assertOk();

    $media = Media::query()->sole();

    expect($media->path)->toStartWith('media/')
        ->and(Storage::disk('public')->exists($media->path))->toBeTrue()
        ->and(Storage::disk('public')->exists('tmp/abc123.jpg'))->toBeFalse();
});

test('a sealed context overrides the configured signed flag and disk', function (): void {
    config()->set('media.signed_uploads', false);
    Storage::fake('uploads');
    Storage::disk('uploads')->put('tmp/abc123.jpg', 'bytes');

    $this->callAction(
        UploadMediaAction::class,
        ['files' => ['tmp/abc123.jpg']],
        ['signed' => true, 'disk' => 'uploads'],
    )->assertOk();

    $media = Media::query()->sole();

    expect($media->disk)->toBe('uploads')
        ->and($media->path)->toStartWith('media/')
        ->and(Storage::disk('uploads')->exists($media->path))->toBeTrue()
        ->and(Storage::disk('uploads')->exists('tmp/abc123.jpg'))->toBeFalse();
});

test('multipart uploads land on the context disk', function (): void {
    Storage::fake('uploads');

    $this->callAction(
        UploadMediaAction::class,
        ['files' => [UploadedFile::fake()->image('team.jpg')]],
        ['disk' => 'uploads'],
    )->assertOk();

    $media = Media::query()->sole();

    expect($media->disk)->toBe('uploads')
        ->and(Storage::disk('uploads')->exists($media->path))->toBeTrue()
        ->and(Storage::disk('public')->exists($media->path))->toBeFalse();
});

test('context accepted types override the configured ones', function (): void {
    config()->set('media.accepted_types', ['application/pdf']);

    $this->callAction(
        UploadMediaAction::class,
        ['files' => [UploadedFile::fake()->image('team.jpg')]],
        ['accepted_types' => ['image/*']],
    )->assertOk();

    expect(Media::query()->sole()->mime_type)->toBe('image/jpeg');
});

test('signed uploads fall back to the default mime type when the disk cannot resolve it', function (): void {
    config()->set('media.signed_uploads', true);
    $realDisk = Storage::disk('public');
    $realDisk->put('tmp/broken.bin', 'bytes');

    Storage::set('public', new class($realDisk->getDriver(), $realDisk->getAdapter(), $realDisk->getConfig()) extends FilesystemAdapter
    {
        /**
         * @param  string  $path
         */
        #[Override]
        public function mimeType($path): string|false
        {
            return false;
        }
    });

    $this->callAction(UploadMediaAction::class, ['files' => ['tmp/broken.bin']])->assertOk();

    $media = Media::query()->sole();

    expect($media->mime_type)->toBe('application/octet-stream')
        ->and($realDisk->exists($media->path))->toBeTrue();
});

test('signs, uploads, and finalizes a key against rustfs end-to-end', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

    $context = ['signed' => true, 'disk' => 's3'];
    $tempKey = null;
    $finalPath = null;

    try {
        $signed = $this->callAction(UploadMediaAction::class, [
            '_sub' => 'upload',
            '_target' => 'files',
            'filename' => 'invoice.pdf',
            'contentType' => 'application/pdf',
        ], $context)->assertOk()->json();

        expect($signed['method'])->toBe('put')
            ->and($signed['key'])->toStartWith('tmp/');

        $tempKey = $signed['key'];

        $put = Http::withHeaders($signed['headers'])->send('PUT', $signed['url'], ['body' => 'hello rustfs']);

        expect($put->successful())->toBeTrue()
            ->and(Storage::disk('s3')->exists($tempKey))->toBeTrue();

        $this->callAction(UploadMediaAction::class, ['files' => [$tempKey]], $context)->assertOk();

        $media = Media::query()->sole();
        $finalPath = $media->path;

        expect($media->disk)->toBe('s3')
            ->and($media->path)->not->toStartWith('tmp/')
            ->and(Storage::disk('s3')->exists($media->path))->toBeTrue();
    } finally {
        if ($tempKey !== null) {
            Storage::disk('s3')->delete($tempKey);
        }

        if ($finalPath !== null) {
            Storage::disk('s3')->delete($finalPath);
        }

        Media::query()->where('disk', 's3')->delete();
    }
})->group('rustfs');

test('a signed upload ends with a real derivative object on s3', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

    $context = ['signed' => true, 'disk' => 's3'];
    $tempKey = null;
    $media = null;

    try {
        $signed = $this->callAction(UploadMediaAction::class, [
            '_sub' => 'upload',
            '_target' => 'files',
            'filename' => 'photo.jpg',
            'contentType' => 'image/jpeg',
        ], $context)->assertOk()->json();

        $tempKey = $signed['key'];

        $put = Http::withHeaders([...$signed['headers'], 'Content-Type' => 'image/jpeg'])->send('PUT', $signed['url'], [
            'body' => (string) UploadedFile::fake()->image('photo.jpg', 900, 600)->getContent(),
        ]);

        expect($put->successful())->toBeTrue();

        // The queue is sync here, so finalizing runs the conversion job inline.
        $this->callAction(UploadMediaAction::class, ['files' => [$tempKey]], $context)->assertOk();

        $media = Media::query()->sole();
        $derivative = $media->conversionPath('thumb');

        expect($media->mime_type)->toBe('image/jpeg')
            ->and($derivative)->not->toBeNull()
            ->and($derivative)->toEndWith('-thumb.webp')
            ->and(Storage::disk('s3')->exists((string) $derivative))->toBeTrue()
            ->and(Storage::disk('s3')->get((string) $derivative))->toStartWith('RIFF')
            ->and($media->width)->toBe(900)
            ->and($media->height)->toBe(600);
    } finally {
        if ($tempKey !== null) {
            Storage::disk('s3')->delete($tempKey);
        }

        $media?->delete();
        Media::query()->where('disk', 's3')->delete();
    }
})->group('rustfs');

test('a sealed category context stamps every multipart upload', function (): void {
    $this->callAction(
        UploadMediaAction::class,
        ['files' => [UploadedFile::fake()->image('import.jpg')]],
        ['category' => 'imports'],
    )->assertOk();

    expect(Media::query()->sole()->category)->toBe('imports');
});

test('signed uploads inherit the sealed category once finalized', function (): void {
    config()->set('media.signed_uploads', true);
    Storage::disk('public')->put('tmp/abc123.jpg', 'bytes');

    $this->callAction(UploadMediaAction::class, ['files' => ['tmp/abc123.jpg']], ['category' => 'imports'])
        ->assertOk();

    expect(Media::query()->sole()->category)->toBe('imports');
});

test('the upload response carries full display descriptors', function (): void {
    $response = $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('team.jpg', 100, 100)],
    ])->assertOk();

    $media = Media::query()->sole();

    $response->assertJsonPath('data.media.0.id', $media->getKey())
        ->assertJsonPath('data.media.0.name', 'team.jpg')
        ->assertJsonPath('data.media.0.mime_type', 'image/jpeg')
        ->assertJsonPath('data.media.0.url', $media->url())
        ->assertJsonPath('data.media.0.preview_url', $media->previewUrl());
});

test('multipart uploads queue their conversions', function (): void {
    Bus::fake();

    $this->callAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('team.jpg')],
    ])->assertOk();

    $media = Media::query()->sole();

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 1);
    Bus::assertDispatched(
        GenerateMediaConversions::class,
        fn (GenerateMediaConversions $job): bool => $job->media->is($media) && ! $job->attachable instanceof Model,
    );
});

test('signed uploads queue their conversions once finalized', function (): void {
    Bus::fake();
    config()->set('media.signed_uploads', true);
    Storage::disk('public')->put('tmp/abc123.jpg', 'bytes');

    $this->callAction(UploadMediaAction::class, ['files' => ['tmp/abc123.jpg']])->assertOk();

    $media = Media::query()->sole();

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 1);
    Bus::assertDispatched(
        GenerateMediaConversions::class,
        fn (GenerateMediaConversions $job): bool => $job->media->is($media),
    );
});

test('guests cannot upload', function (): void {
    auth()->logout();

    $this->callDeniedAction(UploadMediaAction::class, [
        'files' => [UploadedFile::fake()->image('x.jpg')],
    ])->assertForbidden();
});
