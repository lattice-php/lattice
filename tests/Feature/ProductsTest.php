<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\InvalidTableQuery;
use Lattice\Lattice\Tables\TableQuery;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;
use Workbench\App\Seeders\ProductSeeder;
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

/**
 * @param  array<string, mixed>  $component
 * @param  array<string, string>  $extra
 * @return array<string, string>
 */
function productHeaders(array $component, array $extra = []): array
{
    return ['X-Lattice-Ref' => productComponentRef($component), ...$extra];
}

test('forms serialize initial state for bound edit values', function () {
    $form = wire(Form::make('product-form')
        ->fill([
            'name' => 'Desk Lamp',
            'sku' => 'LAMP-001',
        ])
        ->schema([
            TextInput::make('name', 'Name'),
        ]));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'product-form',
        ])
        ->and($form['props']['state'])->toBe([
            'name' => 'Desk Lamp',
            'sku' => 'LAMP-001',
        ]);
});

test('forms can enable precognitive validation with a delay', function () {
    $form = wire(Form::make('product-form')
        ->precognitive(650));

    expect($form['props']['precognitive'])->toBeTrue()
        ->and($form['props']['validationTimeout'])->toBe(650);
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
            ->where('lattice.schema.0.schema.0.schema.1.props.href', '/products/create')
            ->where('lattice.schema.0.schema.1.id', 'workbench.products')
            ->where('lattice.schema.0.schema.1.props.data.0.name', 'Desk Lamp')
        );
});

test('the product form creates products', function () {
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ], productHeaders($form))
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
            ->where('lattice.schema.0.schema.1.props.method', 'patch')
            ->where('lattice.schema.0.schema.1.props.submitLabel', 'Save product')
            ->where('lattice.schema.0.schema.1.props.state.name', 'Desk Lamp')
            ->where('lattice.schema.0.schema.1.props.state.sku', 'LAMP-001')
            ->where('lattice.schema.0.schema.1.props.state.price', '49.99')
            ->where('lattice.schema.0.schema.1.props.state.status', 'draft')
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

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'product_id' => $tamperedProduct->getKey(),
        'name' => 'Updated Lamp',
        'sku' => 'LAMP-002',
        'price' => '59.99',
        'status' => 'active',
    ], productHeaders($form))
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

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => '',
        'sku' => '',
        'price' => 'invalid',
        'status' => 'retired',
    ], productHeaders($form))
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

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => '',
        'sku' => '',
        'price' => 'invalid',
        'status' => 'retired',
    ], productHeaders($form, [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,price',
    ]))
        ->assertHeader('Precognition', 'true')
        ->assertJsonValidationErrors(['name', 'price'])
        ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);

    expect(Product::query()->count())->toBe(0);
});

test('the product form accepts valid precognitive validation without creating products', function () {
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ], productHeaders($form, [
        'Accept' => 'application/json',
        'Precognition' => 'true',
    ]))
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

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ], productHeaders($form, [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'sku',
    ]))
        ->assertHeader('Precognition', 'true')
        ->assertHeader('Precognition-Success', 'true')
        ->assertNoContent();

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'SHELF-001',
        'price' => '49.99',
        'status' => 'active',
    ], productHeaders($form, [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'sku',
    ]))
        ->assertHeader('Precognition', 'true')
        ->assertJsonValidationErrors(['sku'])
        ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);

    $trustedProduct->refresh();

    expect($trustedProduct->sku)->toBe('LAMP-001')
        ->and($trustedProduct->status)->toBe('draft');
});

test('the product seeder creates sample product data idempotently', function () {
    app(ProductSeeder::class)->run();
    app(ProductSeeder::class)->run();

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

test('the product archive row action authorizes per row', function () {
    Lattice::actions([ArchiveProductAction::class]);

    $archived = Product::factory()->create(['status' => 'archived']);

    $ref = productComponentRef(
        wire(Action::use(ArchiveProductAction::class)
            ->context(['product_id' => $archived->getKey()])),
    );

    patch('/lattice/actions/workbench.products.archive', [], ['X-Lattice-Ref' => $ref])
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
        'selected' => [$a->getKey(), $b->getKey()],
    ], ['X-Lattice-Ref' => $ref])
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
        'selected' => [$a->getKey(), 999999],
    ], ['X-Lattice-Ref' => $ref])
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

test('the products table is serialized as striped', function () {
    Lattice::tables([ProductsTable::class]);

    expect(data_get(wire(Table::use(ProductsTable::class)), 'props.striped'))->toBeTrue();
});

test('the products table serializes bulk actions bound to the table', function () {
    Lattice::tables([ProductsTable::class]);
    Lattice::bulkActions([ArchiveSelectedProductsAction::class, RejectSelectedProductsAction::class]);

    $bulkActions = data_get(wire(Table::use(ProductsTable::class)), 'props.bulkActions');

    expect($bulkActions)->toBeArray()->toHaveCount(2)
        ->and($bulkActions[0]['id'])->toBe('workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['endpoint'])
        ->toBe('/lattice/bulk-actions/workbench.products.archive-selected')
        ->and($bulkActions[0]['props']['ref'])->toBeString()
        ->and($bulkActions[1]['id'])->toBe('workbench.products.reject-selected')
        ->and($bulkActions[1]['props']['form']['schema'][0]['props']['name'])->toBe('reason');
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
        'allMatching' => true,
        'filter' => 'status:eq:active',
    ], ['X-Lattice-Ref' => $ref])
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
        'allMatching' => true,
        'filter' => 'id:eq:1',
    ], ['X-Lattice-Ref' => $ref])
        ->assertUnprocessable()
        ->assertJsonPath('errors.filter.0', 'Filter [id] is not allowed for table [workbench.products].');
});

test('the products table applies date, boolean, and number clause filters', function () {
    $featured = Product::factory()->create(['featured' => true, 'price' => '120.00', 'updated_at' => '2026-06-01 10:00:00']);
    Product::factory()->create(['featured' => false, 'price' => '20.00', 'updated_at' => '2026-06-02 10:00:00']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter) => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('featured:eq:true')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('updated_at:before:2026-06-02')->pluck('id')->all())->toBe([$featured->getKey()])
        ->and($resolve('price:gte:100')->pluck('id')->all())->toBe([$featured->getKey()]);
});

test('the products table applies text, starts/ends-with, and presence filters', function () {
    $widget = Product::factory()->create(['name' => 'Widget']);
    $gizmo = Product::factory()->create(['name' => 'Gizmo']);
    $blank = Product::factory()->create(['name' => '']);

    $table = new ProductsTable;
    $columns = $table->columns();

    $resolve = fn (string $filter) => $table->source()->resolveMatching(
        TableQuery::fromRequest(Request::create('/', 'GET', ['filter' => $filter]), $columns, 'workbench.products'),
    );

    expect($resolve('name:starts_with:Wid')->pluck('id')->all())->toBe([$widget->getKey()])
        ->and($resolve('name:ends_with:zmo')->pluck('id')->all())->toBe([$gizmo->getKey()])
        ->and($resolve('name:empty:')->pluck('id')->all())->toBe([$blank->getKey()])
        ->and($resolve('name:filled:')->pluck('id')->sort()->values()->all())->toBe([$widget->getKey(), $gizmo->getKey()]);
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

test('bulk form actions validate the submitted reason before archiving', function () {
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

test('bulk form actions validate precognitively without archiving', function () {
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
