<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
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

    $ref = componentRef(
        wire(Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $target->getKey()])),
    );

    patch('/lattice/actions/workbench.products.archive', [
        'context' => ['product_id' => $other->getKey()],
        'product_id' => $other->getKey(),
    ], ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonPath('data.id', $target->getKey());

    expect($target->fresh()->status)->toBe('archived')
        ->and($other->fresh()->status)->toBe('active');
});

test('the product archive row action authorizes per row', function (): void {
    Lattice::actions([ArchiveProductAction::class]);

    $archived = Product::factory()->create(['status' => 'archived']);

    $ref = componentRef(
        wire(Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $archived->getKey()])),
    );

    patch('/lattice/actions/workbench.products.archive', [], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});

test('bulk actions resolve the selection through the table and archive only those rows', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $a = Product::factory()->create(['status' => 'active']);
    $b = Product::factory()->create(['status' => 'active']);
    $c = Product::factory()->create(['status' => 'active']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'selected' => [$a->getKey(), $b->getKey()],
    ], ['X-Lattice-Ref' => $ref])
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

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'selected' => [$a->getKey(), 999999],
    ], ['X-Lattice-Ref' => $ref])
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

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'allMatching' => true,
        'tf' => [
            'featured' => 'true',
        ],
    ], ['X-Lattice-Ref' => $ref])
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

    $ref = data_get(
        wire(BulkAction::use(ArchiveSelectedProductsAction::class)
            ->context(['table' => 'workbench.products'])),
        'props.ref',
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'selected' => [$product->getKey()],
    ], ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonPath('data.archived', 1);

    expect($product->fresh()->status)->toBe('archived');
});

test('bulk form actions validate the submitted reason before archiving', function (): void {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([RejectSelectedProductsAction::class]);

    $product = Product::factory()->create(['status' => 'active']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
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
        'bulkAction',
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
