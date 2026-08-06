<?php
declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Lattice\Media\Jobs\GenerateMediaConversions;
use Lattice\Media\Models\Media;
use Lattice\Tests\Fixtures\Media\ConversionProduct;
use Workbench\App\Models\Product;

function galleryImage(): Media
{
    expect(Storage::disk('public')->put(
        'media/shot.jpg',
        (string) UploadedFile::fake()->image('shot.jpg', 600, 400)->getContent(),
    ))->toBeTrue();

    return Media::factory()->create(['path' => 'media/shot.jpg', 'mime_type' => 'image/jpeg']);
}

function conversionProduct(string $name): ConversionProduct
{
    return ConversionProduct::query()->create([
        'name' => $name,
        'sku' => 'conversion-'.$name,
        'status' => 'active',
    ]);
}

beforeEach(function (): void {
    Storage::fake('public');
});

test('attaching media queues one job per new attachment, carrying the attachable and the collection', function (): void {
    Bus::fake();
    $product = Product::factory()->create();
    [$a, $b] = Media::factory()->count(2)->create();

    $product->syncMedia([$a->getKey(), $b->getKey()], 'gallery');

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 2);

    foreach ([$a, $b] as $media) {
        Bus::assertDispatched(
            GenerateMediaConversions::class,
            fn (GenerateMediaConversions $job): bool => $job->media->is($media)
                && $job->attachable?->is($product) === true
                && $job->collection === 'gallery',
        );
    }
});

test('a re-sync of the same set queues nothing', function (): void {
    Bus::fake();
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    $product->syncMedia([$media->getKey()], 'gallery');
    $product->syncMedia([$media->getKey()], 'gallery');

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 1);
});

test('reordering an attached set queues nothing', function (): void {
    Bus::fake();
    $product = Product::factory()->create();
    [$a, $b] = Media::factory()->count(2)->create();

    $product->syncMedia([$a->getKey(), $b->getKey()], 'gallery');
    $product->syncMedia([$b->getKey(), $a->getKey()], 'gallery');

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 2);

    expect($product->refresh()->media('gallery')->pluck('media.id')->all())
        ->toBe([$b->getKey(), $a->getKey()]);
});

test('a partial re-sync queues only the media that were not attached before', function (): void {
    Bus::fake();
    $product = Product::factory()->create();
    [$a, $b] = Media::factory()->count(2)->create();

    $product->syncMedia([$a->getKey()], 'gallery');
    $product->syncMedia([$a->getKey(), $b->getKey()], 'gallery');

    Bus::assertDispatchedTimes(GenerateMediaConversions::class, 2);
    Bus::assertDispatched(
        GenerateMediaConversions::class,
        fn (GenerateMediaConversions $job): bool => $job->media->is($b),
    );
});

test("the collection's conversion is generated on top of the defaults", function (): void {
    $media = galleryImage();

    new GenerateMediaConversions($media, Product::factory()->create(), 'gallery')->handle();
    $media->refresh();

    expect(array_keys($media->conversions()))->toEqualCanonicalizing(['thumb', 'card'])
        ->and($media->conversions()['card'] ?? null)
        ->toBe(['path' => 'media/conversions/shot-card.webp', 'width' => 1200, 'height' => 800])
        ->and(Storage::disk('public')->exists((string) $media->conversionPath('thumb')))->toBeTrue()
        ->and(Storage::disk('public')->exists((string) $media->conversionPath('card')))->toBeTrue();
});

test('a bare string reuses the globally defined conversion of that name', function (): void {
    $media = galleryImage();

    new GenerateMediaConversions($media, conversionProduct('legacy'), 'legacy')->handle();
    $media->refresh();

    expect(array_keys($media->conversions()))->toBe(['thumb'])
        ->and(Storage::disk('public')->files('media/conversions'))->toHaveCount(1);
});

test('a bare string naming no global conversion fails loudly', function (): void {
    $media = galleryImage();
    $product = conversionProduct('typo');

    expect(function () use ($media, $product): void {
        new GenerateMediaConversions($media, $product, 'typo')->handle();
    })->toThrow(RuntimeException::class, 'The [thumbnail] media conversion is not defined');
});

test('two collections asking for the same conversion name produce one file and one map entry', function (): void {
    $media = galleryImage();
    $product = conversionProduct('shared');

    new GenerateMediaConversions($media, $product, 'gallery')->handle();
    $generated = $media->refresh()->conversions();

    new GenerateMediaConversions($media, $product, 'hero')->handle();

    expect($media->refresh()->conversions())->toBe($generated)
        ->and(Storage::disk('public')->files('media/conversions'))->toHaveCount(2);
});

test('detaching deletes no derivative: another attachment may rely on the same name', function (): void {
    $media = galleryImage();
    $product = Product::factory()->create();
    $product->syncMedia([$media->getKey()], 'gallery');

    new GenerateMediaConversions($media, $product, 'gallery')->handle();
    $paths = $media->refresh()->conversionPaths();

    $product->syncMedia([], 'gallery');

    expect($media->refresh()->conversionPaths())->toBe($paths);

    foreach ($paths as $path) {
        expect(Storage::disk('public')->exists($path))->toBeTrue();
    }
});
