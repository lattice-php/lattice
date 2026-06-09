<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Core\Action;
use Bambamboole\Lattice\Components\Core\BulkAction;
use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Components\Table\Table;
use Bambamboole\Lattice\Facades\Lattice;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Bambamboole\Lattice\Tables\InvalidTableQuery;
use Bambamboole\Lattice\Tables\TableQuery;
use Illuminate\Http\Request;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;
use Workbench\App\Seeders\WorkbenchProductSeeder;
use Workbench\App\Tables\ProductsTable;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

/**
 * @param  array<string, mixed>  $component
 */
function productComponentRef(array $component): string
{
    $props = $component['props'] ?? [];
    $ref = is_array($props) ? ($props['ref'] ?? null) : null;

    if (! is_string($ref)) {
        throw new RuntimeException('Lattice component ref is missing.');
    }

    return $ref;
}

test('forms serialize initial state for bound edit values', function () {
    $form = Form::make('product-form')
        ->fill([
            'name' => 'Desk Lamp',
            'sku' => 'LAMP-001',
        ])
        ->schema([
            TextInput::make('name', 'Name'),
        ])
        ->toArray();

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'product-form',
            'props' => [
                'state' => [
                    'name' => 'Desk Lamp',
                    'sku' => 'LAMP-001',
                ],
            ],
        ]);
});

test('forms can enable precognitive validation with a delay', function () {
    $form = Form::make('product-form')
        ->precognitive(650)
        ->toArray();

    expect($form)
        ->toMatchArray([
            'props' => [
                'precognitive' => true,
                'validationTimeout' => 650,
            ],
        ]);
});

test('the product index page lists products and links to creation', function () {
    Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    withoutVite();

    get('/products')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page', false)
            ->where('lattice.title', 'Products')
            ->where('lattice.components.0.children.0.children.1.props.href', '/products/create')
            ->where('lattice.components.0.children.1.id', 'workbench.products')
            ->where('lattice.components.0.children.1.props.data.0.name', 'Desk Lamp')
        );
});

test('the product form creates products', function () {
    Lattice::forms([ProductForm::class]);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ])
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'LAMP-001')->first();

    expect($product)->not->toBeNull()
        ->and($product?->name)->toBe('Desk Lamp')
        ->and($product?->price)->toBe('49.99')
        ->and($product?->status)->toBe('active');
});

test('the product edit page binds existing product state', function () {
    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
    ]);

    withoutVite();

    get("/products/{$product->getKey()}/edit")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page', false)
            ->where('lattice.title', 'Edit Product')
            ->where('lattice.components.0.children.1.props.method', 'patch')
            ->where('lattice.components.0.children.1.props.submitLabel', 'Save product')
            ->where('lattice.components.0.children.1.props.state.name', 'Desk Lamp')
            ->where('lattice.components.0.children.1.props.state.sku', 'LAMP-001')
            ->where('lattice.components.0.children.1.props.state.price', '49.99')
            ->where('lattice.components.0.children.1.props.state.status', 'draft')
        );
});

test('the product form updates the trusted product from sealed context', function () {
    Lattice::forms([ProductForm::class]);

    $trustedProduct = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
    ]);
    $tamperedProduct = Product::factory()->create([
        'name' => 'Shelf',
        'sku' => 'SHELF-001',
        'price' => '89.00',
        'status' => 'active',
    ]);

    $form = Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()])
        ->toArray();

    patch('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'product_id' => $tamperedProduct->getKey(),
        'name' => 'Updated Lamp',
        'sku' => 'LAMP-002',
        'price' => '59.99',
        'status' => 'active',
    ])
        ->assertRedirect('/products');

    $trustedProduct->refresh();
    $tamperedProduct->refresh();

    expect($trustedProduct->name)->toBe('Updated Lamp')
        ->and($trustedProduct->sku)->toBe('LAMP-002')
        ->and($trustedProduct->price)->toBe('59.99')
        ->and($trustedProduct->status)->toBe('active')
        ->and($tamperedProduct->name)->toBe('Shelf')
        ->and($tamperedProduct->sku)->toBe('SHELF-001');
});

test('the product form validates required fields', function () {
    Lattice::forms([ProductForm::class]);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => '',
        'sku' => '',
        'price' => 'invalid',
        'status' => 'retired',
    ])
        ->assertSessionHasErrors([
            'name',
            'sku',
            'price',
            'status',
        ])
        ->assertStatus(Response::HTTP_FOUND);
});

test('the product form returns precognitive validation errors without creating products', function () {
    Lattice::forms([ProductForm::class]);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => '',
        'sku' => '',
        'price' => 'invalid',
        'status' => 'retired',
    ], [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,price',
    ])
        ->assertHeader('Precognition', 'true')
        ->assertJsonValidationErrors(['name', 'price'])
        ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);

    expect(Product::query()->count())->toBe(0);
});

test('the product form accepts valid precognitive validation without creating products', function () {
    Lattice::forms([ProductForm::class]);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ], [
        'Accept' => 'application/json',
        'Precognition' => 'true',
    ])
        ->assertHeader('Precognition', 'true')
        ->assertHeader('Precognition-Success', 'true')
        ->assertNoContent();

    expect(Product::query()->count())->toBe(0);
});

test('the product form validates edit uniqueness from sealed context during precognition', function () {
    Lattice::forms([ProductForm::class]);

    $trustedProduct = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
    ]);
    Product::factory()->create([
        'name' => 'Shelf',
        'sku' => 'SHELF-001',
        'price' => '89.00',
        'status' => 'active',
    ]);

    $form = Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()])
        ->toArray();

    patch('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ], [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'sku',
    ])
        ->assertHeader('Precognition', 'true')
        ->assertHeader('Precognition-Success', 'true')
        ->assertNoContent();

    patch('/lattice/forms/workbench.products.form', [
        '_lattice' => productComponentRef($form),
        'name' => 'Desk Lamp',
        'sku' => 'SHELF-001',
        'price' => '49.99',
        'status' => 'active',
    ], [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'sku',
    ])
        ->assertHeader('Precognition', 'true')
        ->assertJsonValidationErrors(['sku'])
        ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);

    $trustedProduct->refresh();

    expect($trustedProduct->sku)->toBe('LAMP-001')
        ->and($trustedProduct->status)->toBe('draft');
});

test('the product seeder creates sample product data idempotently', function () {
    app(WorkbenchProductSeeder::class)->run();
    app(WorkbenchProductSeeder::class)->run();

    expect(Product::query()->count())->toBe(100)
        ->and(Product::query()->where('sku', 'workbench-product-001')->exists())->toBeTrue()
        ->and(Product::query()->where('sku', 'workbench-product-100')->exists())->toBeTrue()
        ->and(Product::query()->whereNotIn('status', ['draft', 'active', 'archived'])->exists())->toBeFalse();
});

test('the product archive row action is pinned to its sealed product', function () {
    Lattice::actions([ArchiveProductAction::class]);

    $target = Product::factory()->create(['status' => 'active']);
    $other = Product::factory()->create(['status' => 'active']);

    $ref = productComponentRef(
        Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $target->getKey()])
            ->toArray(),
    );

    patch('/lattice/actions/workbench.products.archive', [
        '_lattice' => $ref,
        'context' => ['product_id' => $other->getKey()],
        'product_id' => $other->getKey(),
    ])
        ->assertOk()
        ->assertJsonPath('data.id', $target->getKey());

    expect($target->fresh()->status)->toBe('archived')
        ->and($other->fresh()->status)->toBe('active');
});

test('the product archive row action authorizes per row', function () {
    Lattice::actions([ArchiveProductAction::class]);

    $archived = Product::factory()->create(['status' => 'archived']);

    $ref = productComponentRef(
        Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $archived->getKey()])
            ->toArray(),
    );

    patch('/lattice/actions/workbench.products.archive', ['_lattice' => $ref])
        ->assertForbidden();
});

test('bulk actions resolve the selection through the table and archive only those rows', function () {
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
        '_lattice' => $ref,
        'selected' => [$a->getKey(), $b->getKey()],
    ])
        ->assertOk()
        ->assertJsonPath('data.archived', 2);

    expect($a->fresh()->status)->toBe('archived')
        ->and($b->fresh()->status)->toBe('archived')
        ->and($c->fresh()->status)->toBe('active');
});

test('bulk actions ignore selected ids that are not in the table result', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $a = Product::factory()->create(['status' => 'active']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        '_lattice' => $ref,
        'selected' => [$a->getKey(), 999999],
    ])
        ->assertOk()
        ->assertJsonPath('data.archived', 1);

    expect($a->fresh()->status)->toBe('archived');
});

test('bulk action endpoints require a valid component reference', function () {
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        'selected' => [1],
    ])->assertForbidden();
});

test('bulk actions execute through their serialized component reference', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $product = Product::factory()->create(['status' => 'active']);

    $ref = data_get(
        BulkAction::use(ArchiveSelectedProductsAction::class)
            ->context(['table' => 'workbench.products'])
            ->toArray(),
        'props.ref',
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        '_lattice' => $ref,
        'selected' => [$product->getKey()],
    ])
        ->assertOk()
        ->assertJsonPath('data.archived', 1);

    expect($product->fresh()->status)->toBe('archived');
});

test('the products table serializes bulk actions bound to the table', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $bulkActions = data_get(Table::use(ProductsTable::class)->toArray(), 'props.bulkActions');

    expect($bulkActions)->toBeArray()->toHaveCount(1)
        ->and($bulkActions[0]['id'])->toBe('workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['endpoint'])
        ->toBe('/lattice/bulk-actions/workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['ref'])->toBeString();
});

test('bulk actions can target every row matching the current filter', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    Product::factory()->count(3)->create(['status' => 'active']);
    $draft = Product::factory()->create(['status' => 'draft']);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        '_lattice' => $ref,
        'allMatching' => true,
        'filter' => 'status:equals:active',
    ])
        ->assertOk()
        ->assertJsonPath('data.archived', 3);

    expect(Product::query()->where('status', 'archived')->count())->toBe(3)
        ->and($draft->fresh()->status)->toBe('draft');
});

test('bulk all-matching validates the filter against the table columns', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class]);

    $ref = app(ComponentReferenceSigner::class)->seal(
        'bulkAction',
        'workbench.products.archive-selected',
        ['table' => 'workbench.products'],
    );

    patch('/lattice/bulk-actions/workbench.products.archive-selected', [
        '_lattice' => $ref,
        'allMatching' => true,
        'filter' => 'id:equals:1',
    ])
        ->assertUnprocessable()
        ->assertJsonPath('errors.filter.0', 'Filter [id] is not allowed for table [workbench.products].');
});

test('the products table applies date, boolean, and number clause filters', function () {
    $featured = Product::factory()->create(['featured' => true, 'price' => '120.00', 'updated_at' => '2026-06-01 10:00:00']);
    Product::factory()->create(['featured' => false, 'price' => '20.00', 'updated_at' => '2026-06-02 10:00:00']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter) => $table->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('featured:equals:true')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('updated_at:before:2026-06-02')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('price:gte:100')->pluck('id')->all())->toBe([$featured->getKey()]);
});

test('the products table rejects a filter operator not allowed for the column', function () {
    $columns = (new ProductsTable)->columns();

    expect(fn () => TableQuery::fromRequest(
        Request::create('/', 'GET', ['filter' => 'featured:contains:x']),
        $columns,
        'workbench.products',
    ))->toThrow(
        InvalidTableQuery::class,
        'Operator [contains] is not allowed for filter [featured] on table [workbench.products].',
    );
});
