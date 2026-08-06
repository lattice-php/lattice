<?php
declare(strict_types=1);

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Image\Image;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;
use Lattice\Tests\Fixtures\Media\PartialConversionMedia;

/** A fake disk swallows write failures into `false`; a skipped branch ten lines later would not say so. */
function writeToDisk(string $path, string $contents): void
{
    expect(Storage::disk('public')->put($path, $contents))->toBeTrue();
}

function storedImage(int $width = 320, int $height = 200): Media
{
    writeToDisk('media/source.jpg', (string) UploadedFile::fake()->image('source.jpg', $width, $height)->getContent());

    return Media::factory()->create(['path' => 'media/source.jpg', 'mime_type' => 'image/jpeg']);
}

/**
 * A PNG carrying a valid IHDR and no pixel data. `getimagesizefromstring`
 * reads the IHDR only, so the header probe sees a convertible image of the
 * declared size while the driver cannot decode a single pixel of it.
 */
function pngHeader(int $width, int $height): string
{
    return "\x89PNG\r\n\x1a\n".pack('N', 13).'IHDR'.pack('NN', $width, $height)."\x08\x02\x00\x00\x00".pack('N', 0);
}

/** A disk that explodes on read, so a zero-read no-op is provable. */
function unreadableDisk(): void
{
    $disk = Storage::disk('public');

    Storage::set('public', new class($disk->getDriver(), $disk->getAdapter(), $disk->getConfig()) extends FilesystemAdapter
    {
        /**
         * @param  string  $path
         */
        #[Override]
        public function get($path): ?string
        {
            throw new RuntimeException('The source was read.');
        }
    });
}

/** Pins one skip branch by its message, so no other branch can satisfy the test. */
function expectWarning(string $fragment): void
{
    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn (string $message, array $context): bool => str_contains($message, $fragment));
}

beforeEach(function (): void {
    Storage::fake('public');
});

test('the default thumb conversion is generated and recorded', function (): void {
    $media = storedImage(600, 400);

    new GenerateMediaConversions($media)->handle();
    $media->refresh();

    expect($media->width)->toBe(600)
        ->and($media->height)->toBe(400)
        ->and($media->conversions()['thumb'] ?? null)
        ->toBe(['path' => 'media/conversions/source-thumb.webp', 'width' => 400, 'height' => 400])
        ->and(Storage::disk('public')->get('media/conversions/source-thumb.webp'))->toStartWith('RIFF');
});

test('a non-convertible media is skipped without a conversion map', function (): void {
    $media = Media::factory()->create(['path' => 'media/logo.svg', 'mime_type' => 'image/svg+xml']);

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->meta)->toBeNull()
        ->and(Storage::disk('public')->allFiles())->toBe([]);
});

test('a media with every conversion and its dimensions recorded never reads the source', function (): void {
    $media = storedImage();
    $media->update(['meta' => [
        'conversions' => ['thumb' => ['path' => 'x.webp', 'width' => 1, 'height' => 1]],
        'width' => 320,
        'height' => 200,
    ]]);
    unreadableDisk();

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->conversionPath('thumb'))->toBe('x.webp');
});

test('a complete map with no recorded dimensions is probed without touching the map', function (): void {
    $media = storedImage(600, 400);
    $map = ['thumb' => ['path' => 'media/conversions/source-thumb.webp', 'width' => 400, 'height' => 400]];
    $media->update(['meta' => ['conversions' => $map]]);

    new GenerateMediaConversions($media)->handle();
    $media->refresh();

    expect($media->width)->toBe(600)
        ->and($media->height)->toBe(400)
        ->and($media->conversions())->toBe($map)
        ->and(Storage::disk('public')->allFiles())->toBe(['media/source.jpg']);
});

test('a media stored under a generic mime is still probed', function (): void {
    $media = storedImage(600, 400);
    $media->update(['mime_type' => 'application/octet-stream']);

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp');
});

test('a missing conversion does read the source', function (): void {
    $media = storedImage();
    unreadableDisk();

    expect(function () use ($media): void {
        new GenerateMediaConversions($media)->handle();
    })->toThrow(RuntimeException::class, 'The source was read.');
});

test('a conversion that fails to return an image throws, keeping the derivatives already written', function (): void {
    config()->set('media.model', PartialConversionMedia::class);
    $media = storedImage(600, 400);

    expect(function () use ($media): void {
        new GenerateMediaConversions($media)->handle();
    })->toThrow(RuntimeException::class, 'The [broken] media conversion must return an '.Image::class.' instance.');

    $media->refresh();

    expect($media->conversionPath('ok'))->toStartWith('media/conversions/source-ok.')
        ->and($media->conversions()['ok']['width'] ?? null)->toBe(50)
        ->and($media->hasConversion('broken'))->toBeFalse()
        ->and(Storage::disk('public')->exists((string) $media->conversionPath('ok')))->toBeTrue()
        ->and($media->width)->toBe(600)
        ->and($media->height)->toBe(400);
});

test('an image too large for the remaining memory is skipped with a warning', function (): void {
    writeToDisk('media/huge.png', pngHeader(40000, 40000));
    $media = Media::factory()->create(['path' => 'media/huge.png', 'mime_type' => 'image/png']);
    expectWarning('not enough memory');

    $limit = ini_get('memory_limit');

    try {
        ini_set('memory_limit', '512M');
        new GenerateMediaConversions($media)->handle();
    } finally {
        ini_set('memory_limit', $limit);
    }

    expect($media->refresh()->meta)->toBeNull();
});

test('a vanished source is logged instead of failing the job', function (): void {
    $media = Media::factory()->create(['path' => 'media/gone.jpg']);
    expectWarning('the source file is gone');

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->meta)->toBeNull();
});

test('a source that is not an image at all is logged instead of failing the job', function (): void {
    writeToDisk('media/lying.jpg', 'not an image');
    $media = Media::factory()->create(['path' => 'media/lying.jpg']);
    expectWarning('not a convertible image');

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->meta)->toBeNull();
});

test('a source whose real format is not the one its extension claims is skipped', function (): void {
    $image = imagecreatetruecolor(60, 40);
    ob_start();
    imagewbmp($image);
    writeToDisk('media/mislabelled.jpg', (string) ob_get_clean());

    $media = Media::factory()->create(['path' => 'media/mislabelled.jpg', 'mime_type' => 'image/jpeg']);
    expectWarning('not a convertible image');

    new GenerateMediaConversions($media)->handle();

    expect($media->refresh()->meta)->toBeNull();
});

test('a source the driver cannot decode is logged instead of failing the job', function (): void {
    writeToDisk('media/corrupt.png', pngHeader(600, 400));
    $media = Media::factory()->create(['path' => 'media/corrupt.png', 'mime_type' => 'image/png']);
    expectWarning('could not process the source');

    new GenerateMediaConversions($media)->handle();
    $media->refresh();

    expect($media->conversions())->toBe([])
        ->and($media->width)->toBe(600)
        ->and($media->height)->toBe(400);
});

test('the job waits for the surrounding transaction to commit', function (): void {
    expect((new GenerateMediaConversions(Media::factory()->create()))->afterCommit)->toBeTrue();
});

test('the configured queue is honoured', function (): void {
    config()->set('media.queue', 'media');

    expect((new GenerateMediaConversions(Media::factory()->create()))->queue)->toBe('media');
});

test('overlapping jobs for the same media are released, retried and never deadlock', function (): void {
    $media = Media::factory()->create();
    $job = new GenerateMediaConversions($media);
    $middleware = $job->middleware();

    expect($middleware)->toHaveCount(1);
    expect($middleware[0]->key)->toBe((string) $media->getKey());
    expect($middleware[0]->releaseAfter)->toBe(30);
    expect($middleware[0]->expiresAfter)->toBe(300);
    expect($job->tries)->toBeGreaterThan(1);
});
