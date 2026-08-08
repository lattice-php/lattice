<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;
use Lattice\Tests\Fixtures\Media\TwoConversionMedia;

use function Pest\Laravel\artisan;

/** The queue is sync in tests, so the command's dispatches run inline. */
beforeEach(function (): void {
    Storage::fake('public');
});

test('the command backfills a media that never had its conversions generated', function (): void {
    $media = fakeImageMedia();

    artisan('media:conversions')->assertSuccessful();

    $media->refresh();

    expect($media->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp')
        ->and(Storage::disk('public')->exists('media/conversions/source-thumb.webp'))->toBeTrue()
        ->and($media->width)->toBe(320)
        ->and($media->height)->toBe(200);
});

test('a media that is not convertible is never queued', function (): void {
    Media::factory()->create(['path' => 'media/logo.svg', 'mime_type' => 'image/svg+xml']);
    Bus::fake();

    artisan('media:conversions')->assertSuccessful();

    Bus::assertNothingDispatched();
});

test('force deletes the derivative it un-maps, so a renamed output leaves nothing behind', function (): void {
    $media = fakeImageMedia();
    $media->mergeMeta(['conversions' => [
        'thumb' => ['path' => 'media/conversions/source-thumb.jpg', 'width' => 400, 'height' => 400],
    ]]);
    Storage::disk('public')->put('media/conversions/source-thumb.jpg', 'stale');

    artisan('media:conversions --force')->assertSuccessful();

    expect(Storage::disk('public')->exists('media/conversions/source-thumb.jpg'))->toBeFalse()
        ->and($media->refresh()->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp')
        ->and(Storage::disk('public')->exists('media/conversions/source-thumb.webp'))->toBeTrue();
});

test('force regenerates a derivative whose file was removed behind the map', function (): void {
    $media = fakeImageMedia();
    artisan('media:conversions')->assertSuccessful();

    Storage::disk('public')->delete('media/conversions/source-thumb.webp');

    artisan('media:conversions')->assertSuccessful();
    expect(Storage::disk('public')->exists('media/conversions/source-thumb.webp'))->toBeFalse();

    artisan('media:conversions --force')->assertSuccessful();

    expect(Storage::disk('public')->exists('media/conversions/source-thumb.webp'))->toBeTrue()
        ->and($media->refresh()->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp');
});

test('only limits which conversions force drops and rebuilds', function (): void {
    config()->set('media.model', TwoConversionMedia::class);
    $media = fakeImageMedia();
    artisan('media:conversions')->assertSuccessful();

    $media->refresh()->mergeMeta(['conversions' => [
        ...$media->conversions(),
        'square' => ['path' => 'media/conversions/stale.webp', 'width' => 1, 'height' => 1],
    ]]);

    artisan('media:conversions --force --only=thumb')->assertSuccessful();

    expect($media->refresh()->conversionPath('square'))->toBe('media/conversions/stale.webp')
        ->and($media->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp')
        ->and(Storage::disk('public')->exists('media/conversions/source-thumb.webp'))->toBeTrue();
});

test('missing skips a media whose conversions are all present', function (): void {
    $media = fakeImageMedia();
    artisan('media:conversions')->assertSuccessful();
    Bus::fake();

    artisan('media:conversions --missing')->assertSuccessful();

    Bus::assertNothingDispatched();

    artisan('media:conversions')->assertSuccessful();
    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 1);
});

test('missing covers a complete map whose dimensions were never recorded', function (): void {
    $media = fakeImageMedia();
    artisan('media:conversions')->assertSuccessful();
    $media->refresh();
    $map = $media->conversions();
    $media->mergeMeta(['width' => null, 'height' => null]);

    artisan('media:conversions --missing')->assertSuccessful();

    $media->refresh();

    expect($media->width)->toBe(320)
        ->and($media->height)->toBe(200)
        ->and($media->conversions())->toBe($map);
});

test('a media whose stored mime is generic is still reached by the command', function (): void {
    $media = fakeImageMedia();
    $media->update(['mime_type' => 'application/octet-stream']);

    artisan('media:conversions')->assertSuccessful();

    expect($media->refresh()->conversionPath('thumb'))->toBe('media/conversions/source-thumb.webp');
});

test('ids narrow the run to the given media', function (): void {
    $first = fakeImageMedia('first.jpg');
    $second = fakeImageMedia('second.jpg');

    artisan("media:conversions --id={$first->getKey()}")->assertSuccessful();

    expect($first->refresh()->hasConversion('thumb'))->toBeTrue()
        ->and($second->refresh()->hasConversion('thumb'))->toBeFalse();
});
