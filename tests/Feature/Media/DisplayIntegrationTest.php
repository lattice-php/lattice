<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Core\Facades\Lattice;
use Lattice\Media\Models\Media;
use Lattice\Table\Components\Table;
use Workbench\App\Models\Product;
use Workbench\App\Tables\ProductMediaTable;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

beforeEach(function (): void {
    Storage::fake('public');
    Lattice::tables([ProductMediaTable::class]);
    actingAs(workbenchTestUser());
});

test('the product media table exposes the gallery cover url from attached media', function (): void {
    $product = Product::factory()->create(['name' => 'Desk Lamp']);
    $media = Media::factory()->create(['name' => 'lamp.jpg']);

    $product->syncMedia([$media->getKey()], 'gallery');

    $table = wire(Table::use(ProductMediaTable::class));
    $ref = $this->latticeRef($table);

    $response = getJson('/lattice/tables/workbench.products.media', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Desk Lamp');

    expect($response->json('data.0.gallery_cover_url'))->toContain($media->path);
});

test('a product without gallery media has a null cover url', function (): void {
    Product::factory()->create(['name' => 'Blank Product']);

    $table = wire(Table::use(ProductMediaTable::class));
    $ref = $this->latticeRef($table);

    getJson('/lattice/tables/workbench.products.media', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonPath('data.0.gallery_cover_url', null);
});
