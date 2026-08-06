<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Models\Media;

test('url falls back from temporary url to public url', function (): void {
    Storage::fake('public');
    $media = Media::factory()->create(['path' => 'media/a.jpg']);

    expect($media->url())->toContain('media/a.jpg');
});

test('isImage is derived from the mime type', function (): void {
    expect(Media::factory()->create()->isImage())->toBeTrue()
        ->and(Media::factory()->document()->create()->isImage())->toBeFalse();
});

test('isConvertibleMime covers only the mimes the image driver can decode', function (string $mime, bool $convertible): void {
    expect(Media::isConvertibleMime($mime))->toBe($convertible);
})->with([
    ['image/jpeg', true],
    ['image/png', true],
    ['image/bmp', true],
    ['image/gif', true],
    ['image/webp', true],
    ['image/svg+xml', false],
    ['application/pdf', false],
]);

test('an svg is an image but never convertible', function (): void {
    $svg = Media::factory()->make(['mime_type' => 'image/svg+xml']);

    expect($svg->isImage())->toBeTrue()->and(Media::isConvertibleMime($svg->mime_type))->toBeFalse();
});

test('url serves a generated conversion and falls back to the original', function (): void {
    Storage::fake('public');
    $media = Media::factory()->create([
        'path' => 'media/a.jpg',
        'meta' => ['conversions' => ['thumb' => ['path' => 'media/a-thumb.webp', 'width' => 400, 'height' => 400]]],
    ]);

    expect($media->url('thumb'))->toContain('media/a-thumb.webp')
        ->and($media->url('unknown'))->toContain('media/a.jpg')
        ->and($media->url())->toContain('media/a.jpg')
        ->and($media->hasConversion('thumb'))->toBeTrue()
        ->and($media->hasConversion('unknown'))->toBeFalse()
        ->and($media->conversionPath('thumb'))->toBe('media/a-thumb.webp')
        ->and($media->conversionPath('unknown'))->toBeNull();
});

test('media without conversions falls back to the original for every name', function (): void {
    Storage::fake('public');
    $media = Media::factory()->create(['path' => 'media/a.jpg']);

    expect($media->url('thumb'))->toContain('media/a.jpg')
        ->and($media->conversionPaths())->toBe([]);
});

test('toArray exposes the preview url and dimensions', function (): void {
    Storage::fake('public');

    $payload = Media::factory()->create([
        'path' => 'media/a.jpg',
        'meta' => [
            'width' => 1200,
            'height' => 800,
            'conversions' => ['thumb' => ['path' => 'media/a-thumb.webp', 'width' => 400, 'height' => 400]],
        ],
    ])->toArray();

    expect($payload)->toHaveKeys(['url', 'preview_url', 'width', 'height'])
        ->and($payload)->not->toHaveKey('meta')
        ->and($payload['preview_url'])->toContain('media/a-thumb.webp')
        ->and($payload['url'])->toContain('media/a.jpg')
        ->and($payload['width'])->toBe(1200)
        ->and($payload['height'])->toBe(800);
});

test('the preview url falls back to the original before the conversion exists', function (): void {
    Storage::fake('public');

    $payload = Media::factory()->create(['path' => 'media/a.jpg'])->toArray();

    expect($payload['preview_url'])->toContain('media/a.jpg');
});

test('the default conversions ship a thumb', function (): void {
    expect(Media::factory()->make()->defaultConversions())->toHaveKey('thumb');
});

test('deleting media removes the disk object and cascades attachments', function (): void {
    Storage::fake('public');
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'bytes');

    DB::table('media_attachments')->insert([
        'media_id' => $media->getKey(),
        'attachable_type' => 'demo',
        'attachable_id' => 1,
        'collection' => 'default',
        'sort_order' => 1,
    ]);

    $media->delete();

    expect(Storage::disk('public')->exists($media->path))->toBeFalse()
        ->and(DB::table('media_attachments')->count())->toBe(0);
});

test('deleting media removes every generated derivative', function (): void {
    Storage::fake('public');
    $media = Media::factory()->create([
        'path' => 'media/a.jpg',
        'meta' => ['conversions' => [
            'thumb' => ['path' => 'media/a-thumb.webp', 'width' => 400, 'height' => 400],
            'card' => ['path' => 'media/a-card.webp', 'width' => 800, 'height' => 600],
        ]],
    ]);

    foreach (['media/a.jpg', 'media/a-thumb.webp', 'media/a-card.webp'] as $path) {
        Storage::disk('public')->put($path, 'bytes');
    }

    $media->delete();

    expect(Storage::disk('public')->exists('media/a.jpg'))->toBeFalse()
        ->and(Storage::disk('public')->exists('media/a-thumb.webp'))->toBeFalse()
        ->and(Storage::disk('public')->exists('media/a-card.webp'))->toBeFalse();
});

test('attachments are cascaded even when the disk cannot be reached', function (): void {
    $media = Media::factory()->create();

    DB::table('media_attachments')->insert([
        'media_id' => $media->getKey(),
        'attachable_type' => 'demo',
        'attachable_id' => 1,
        'collection' => 'default',
        'sort_order' => 1,
    ]);

    Storage::shouldReceive('disk')->andThrow(new RuntimeException('disk unavailable'));

    expect(fn (): bool => (bool) $media->delete())->toThrow(RuntimeException::class)
        ->and(DB::table('media_attachments')->count())->toBe(0);
});

test('merging meta leaves a consumer-defined key untouched', function (): void {
    $media = Media::factory()->create(['meta' => ['custom' => 'kept']]);

    $media->mergeMeta(['width' => 100, 'height' => 100]);

    expect($media->refresh()->meta)->toBe(['custom' => 'kept', 'width' => 100, 'height' => 100]);
});
