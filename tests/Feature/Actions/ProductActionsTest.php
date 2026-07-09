<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
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

    $this->callAction(ArchiveProductAction::class, [], ['product_id' => $archived->getKey()])
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

    $headers = ['Accept' => 'application/json', 'X-Lattice-Ref' => $ref];

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'selected' => [$product->getKey()],
    ], $headers)
        ->assertStatus(422)
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

    $precognition = [
        'X-Lattice-Ref' => $ref,
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'reason',
    ];

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'reason' => '',
        'selected' => [$product->getKey()],
    ], $precognition)->assertStatus(422)->assertJsonValidationErrors('reason');

    patch('/lattice/bulk-actions/workbench.products.reject-selected', [
        'reason' => 'Counterfeit',
        'selected' => [$product->getKey()],
    ], $precognition)->assertNoContent();

    expect($product->fresh()->status)->toBe('active');
});
