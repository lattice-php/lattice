<?php
declare(strict_types=1);

use Lattice\Media\Models\Media;
use Workbench\App\Models\Product;
use Workbench\App\Tables\ProductMediaTable;

beforeEach(function (): void {
    bootstrapMediaTest(tables: [ProductMediaTable::class]);
});

test('the product media table exposes the gallery cover url from attached media', function (): void {
    $product = Product::factory()->create(['name' => 'Desk Lamp']);
    $media = Media::factory()->create(['name' => 'lamp.jpg']);

    $product->syncMedia([$media->getKey()], 'gallery');

    $response = $this->loadTable(ProductMediaTable::class)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Desk Lamp');

    expect($response->json('data.0.gallery_cover_url'))->toContain($media->path);
});

test('a product without gallery media has a null cover url', function (): void {
    Product::factory()->create(['name' => 'Blank Product']);

    $this->loadTable(ProductMediaTable::class)
        ->assertOk()
        ->assertJsonPath('data.0.gallery_cover_url', null);
});
