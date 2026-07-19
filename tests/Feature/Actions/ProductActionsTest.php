<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\EditProductAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Models\File;
use Workbench\App\Models\Product;
use Workbench\App\Tables\ProductsTable;

use function Pest\Laravel\patch;

test('the product archive row action is pinned to its sealed product', function (): void {
    Lattice::actions([ArchiveProductAction::class]);

    $target = Product::factory()->create(['status' => 'active']);
    $other = Product::factory()->create(['status' => 'active']);

    $this->callAction(ArchiveProductAction::class, [
        'context' => ['product_id' => $other->getKey()],
        'product_id' => $other->getKey(),
    ], ['product_id' => $target->getKey()])
        ->assertOk()
        ->assertJsonPath('data.id', $target->getKey());

    expect($target->fresh()->status)->toBe('archived')
        ->and($other->fresh()->status)->toBe('active');
});

test('the product archive row action authorizes per row', function (): void {
    Lattice::actions([ArchiveProductAction::class]);

    $archived = Product::factory()->create(['status' => 'archived']);

    // The row-actions gate (TableRegistry::decorateResult filtering by shouldRender())
    // hides this action for an archived row (see Authorization/RenderAuthorizationTest.php),
    // so a legitimate render never produces a sealed ref here. Seal one directly to
    // prove the endpoint still enforces its own authorize() check regardless —
    // defense in depth against a forged or stale ref.
    $ref = app(ComponentReferenceSigner::class)->seal('action', 'workbench.products.archive', [
        'product_id' => $archived->getKey(),
    ]);

    patch('/lattice/actions/workbench.products.archive', [], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});

test('bulk actions resolve the selection through the table and archive only those rows', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $a = Product::factory()->create(['status' => 'active']);
    $b = Product::factory()->create(['status' => 'active']);
    $c = Product::factory()->create(['status' => 'active']);

    $this->callBulkAction(ArchiveSelectedProductsAction::class, [
        'selected' => [$a->getKey(), $b->getKey()],
    ], ['table' => 'workbench.products'])
        ->assertOk()
        ->assertJsonPath('data.archived', 2);

    expect($a->fresh()->status)->toBe('archived')
        ->and($b->fresh()->status)->toBe('archived')
        ->and($c->fresh()->status)->toBe('active');
});

test('bulk actions ignore selected ids that are not in the table result', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $a = Product::factory()->create(['status' => 'active']);

    $this->callBulkAction(ArchiveSelectedProductsAction::class, [
        'selected' => [$a->getKey(), 999999],
    ], ['table' => 'workbench.products'])
        ->assertOk()
        ->assertJsonPath('data.archived', 1);

    expect($a->fresh()->status)->toBe('archived');
});

test('bulk actions resolve all matching rows with dedicated table filters', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $featured = Product::factory()->create(['featured' => true, 'status' => 'active']);
    $notFeatured = Product::factory()->create(['featured' => false, 'status' => 'active']);
    $draft = Product::factory()->create(['featured' => true, 'status' => 'draft']);

    $this->callBulkAction(ArchiveSelectedProductsAction::class, [
        'allMatching' => true,
        'tf' => [
            'featured' => ['value' => 'true'],
        ],
    ], ['table' => 'workbench.products'])
        ->assertOk()
        ->assertJsonPath('data.archived', 2);

    expect($featured->fresh()->status)->toBe('archived')
        ->and($notFeatured->fresh()->status)->toBe('active')
        ->and($draft->fresh()->status)->toBe('archived');
});

test('bulk action endpoints require a valid component reference', function (): void {
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'selected' => [1],
    ])->assertForbidden();
});

test('bulk actions execute through their serialized component reference', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $product = Product::factory()->create(['status' => 'active']);

    $this->callBulkAction(ArchiveSelectedProductsAction::class, [
        'selected' => [$product->getKey()],
    ], ['table' => 'workbench.products'])
        ->assertOk()
        ->assertJsonPath('data.archived', 1);

    expect($product->fresh()->status)->toBe('archived');
});

test('bulk form actions validate the submitted reason before archiving', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([RejectSelectedProductsAction::class]);

    $product = Product::factory()->create(['status' => 'active']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'action.bulk',
        'workbench.products.reject-selected',
        ['table' => 'workbench.products'],
    );

    $headers = $this->latticeHeaders($ref, ['Accept' => 'application/json']);

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'selected' => [$product->getKey()],
    ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    expect($product->fresh()->status)->toBe('active');

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'reason' => 'Counterfeit',
        'selected' => [$product->getKey()],
    ], $headers)
        ->assertOk()
        ->assertJsonPath('data.archived', 1)
        ->assertJsonPath('data.reason', 'Counterfeit');

    expect($product->fresh()->status)->toBe('archived');
});

test('bulk form actions validate precognitively without archiving', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([RejectSelectedProductsAction::class]);

    $product = Product::factory()->create(['status' => 'active']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'action.bulk',
        'workbench.products.reject-selected',
        ['table' => 'workbench.products'],
    );

    $precognition = $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'reason',
    ]);

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'reason' => '',
        'selected' => [$product->getKey()],
    ], $precognition)->assertUnprocessable()->assertJsonValidationErrors('reason');

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'reason' => 'Counterfeit',
        'selected' => [$product->getKey()],
    ], $precognition)->assertNoContent();

    expect($product->fresh()->status)->toBe('active');
});

test('the edit product action syncs sales prices', function (): void {
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    $this->callAction(EditProductAction::class, [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['product_id' => $product->getKey()])
        ->assertOk();

    expect($product->salesPrices()->whereNull('group_id')->count())->toBe(1)
        ->and($product->salesPrices()->whereNull('group_id')->first()->amount)->toBe('79.99');
});

test('the edit product action syncs images', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/modal.jpg', 'image-data');
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    $this->callAction(EditProductAction::class, [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'images' => ['tmp/modal.jpg'],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['product_id' => $product->getKey()])
        ->assertOk();

    $image = $product->images()->firstOrFail();

    expect($image->path)->toStartWith('workbench/products/lamp-001-')
        ->and($image->path)->toEndWith('.jpg')
        ->and($image->disk)->toBe('s3');

    Storage::disk('s3')->assertMissing('tmp/modal.jpg');
    Storage::disk('s3')->assertExists($image->path);
});

test('the edit product action removes existing images without new uploads', function (): void {
    Storage::fake('s3');
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);
    Storage::disk('s3')->put('workbench/products/lamp.jpg', 'image-data');
    $image = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/lamp.jpg',
        'name' => 'lamp.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 10,
    ]);
    $product->images()->attach($image->getKey(), ['sort_order' => 1]);

    $removedToken = app(SignsComponentReferences::class)
        ->seal('file', 'images', ['disk' => 's3', 'path' => 'workbench/products/lamp.jpg']);

    $this->callAction(EditProductAction::class, [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'images' => [],
        'images__removed' => [$removedToken],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['product_id' => $product->getKey()])
        ->assertOk();

    expect($product->images()->count())->toBe(0)
        ->and(File::query()->whereKey($image->getKey())->exists())->toBeFalse();

    Storage::disk('s3')->assertMissing('workbench/products/lamp.jpg');
});

test('the edit product action rejects two default sales prices with a 422', function (): void {
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => '49.99']);

    $this->callAction(EditProductAction::class, [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
            ['group_id' => '', 'amount' => '59.99'],
        ],
    ], ['product_id' => $product->getKey()])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['sales_prices']);

    expect($product->salesPrices()->whereNull('group_id')->count())->toBe(1);
});
