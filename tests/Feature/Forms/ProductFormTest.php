<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Actions\EditProductAction;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\patchJson;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

/**
 * @param  array<string, mixed>  $component
 * @param  array<string, string>  $extra
 * @return array<string, string>
 */
function productHeaders(array $component, array $extra = []): array
{
    return ['X-Lattice-Ref' => componentRef($component), ...$extra];
}

test('forms serialize initial state for bound edit values', function () {
    $form = Form::make('product-form')
        ->fill([
            'name' => 'Desk Lamp',
            'sku' => 'LAMP-001',
        ])
        ->schema([
            TextInput::make('name', 'Name'),
        ]);

    $this->assertLatticeComponent($form)
        ->assertHasForm('product-form')
        ->form('product-form', fn (FormAssertions $f) => $f
            ->field('name')->assertInitialValue('Desk Lamp'));

    expect(wire($form)['props']['state'])->toBe([
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
    $this->actingAs(workbenchTestUser());

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
        'status' => 'active',
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
        ],
    ], productHeaders($form))
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'LAMP-001')->first();

    expect($product)->not->toBeNull()
        ->and($product?->name)->toBe('Desk Lamp')
        ->and($product?->defaultSalesPrice?->amount)->toBe('49.99')
        ->and($product?->status)->toBe('active');
});

test('the product edit page binds existing product state', function () {
    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => '49.99']);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    get("/products/{$product->getKey()}/edit")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page', false)
            ->where('lattice.title', 'Edit Product')
            ->where('lattice.schema.0.schema.1.props.method', 'patch')
            ->where('lattice.schema.0.schema.1.props.submitLabel', 'Save product')
            ->where('lattice.schema.0.schema.1.props.state.name', 'Desk Lamp')
            ->where('lattice.schema.0.schema.1.props.state.sku', 'LAMP-001')
            ->where('lattice.schema.0.schema.1.props.state.sales_prices.0.amount', '49.99')
            ->where('lattice.schema.0.schema.1.props.state.sales_prices.0.group_id', '')
            ->where('lattice.schema.0.schema.1.props.state.status', 'draft')
        );
});

test('the product form updates the trusted product from sealed context', function () {
    Lattice::forms([ProductForm::class]);

    $trustedProduct = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);
    $tamperedProduct = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Shelf',
        'sku' => 'SHELF-001',
        'status' => 'active',
    ]);

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'product_id' => $tamperedProduct->getKey(),
        'name' => 'Updated Lamp',
        'sku' => 'LAMP-002',
        'status' => 'active',
        'sales_prices' => [
            ['group_id' => '', 'amount' => '59.99'],
        ],
    ], productHeaders($form))
        ->assertRedirect('/products');

    $trustedProduct->refresh();
    $tamperedProduct->refresh();

    expect($trustedProduct->name)->toBe('Updated Lamp')
        ->and($trustedProduct->sku)->toBe('LAMP-002')
        ->and($trustedProduct->defaultSalesPrice?->amount)->toBe('59.99')
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
        'status' => 'retired',
        'sales_prices' => [
            ['group_id' => '', 'amount' => 'invalid'],
        ],
    ], productHeaders($form))
        ->assertSessionHasErrors([
            'name',
            'sku',
            'status',
            'sales_prices.0.amount',
        ])
        ->assertStatus(Response::HTTP_FOUND);
});

test('the product form returns precognitive validation errors without creating products', function () {
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => '',
        'sku' => '',
        'status' => 'retired',
        'sales_prices' => [
            ['group_id' => '', 'amount' => 'invalid'],
        ],
    ], productHeaders($form, [
        'Accept' => 'application/json',
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,sales_prices.0.amount',
    ]))
        ->assertHeader('Precognition', 'true')
        ->assertJsonValidationErrors(['name', 'sales_prices.0.amount'])
        ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);

    expect(Product::query()->count())->toBe(0);
});

test('the product form accepts valid precognitive validation without creating products', function () {
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
        ],
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
        'status' => 'draft',
    ]);
    Product::factory()->create([
        'name' => 'Shelf',
        'sku' => 'SHELF-001',
        'status' => 'active',
    ]);

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $trustedProduct->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
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

test('the product form create rejects two default sales prices', function () {
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
            ['group_id' => '', 'amount' => '59.99'],
        ],
    ], productHeaders($form))
        ->assertSessionHasErrors(['sales_prices']);

    expect(Product::query()->count())->toBe(0);
});

test('the product form update rejects two default sales prices', function () {
    Lattice::forms([ProductForm::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => '49.99']);

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $product->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
            ['group_id' => '', 'amount' => '59.99'],
        ],
    ], productHeaders($form))
        ->assertSessionHasErrors(['sales_prices']);

    expect($product->salesPrices()->whereNull('group_id')->count())->toBeLessThanOrEqual(1);
});

test('the edit product action syncs sales prices', function () {
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    $ref = componentRef(
        wire(Action::use(EditProductAction::class)
            ->context(['product_id' => $product->getKey()])),
    );

    patchJson('/lattice/actions/workbench.products.edit-modal', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['X-Lattice-Ref' => $ref])
        ->assertOk();

    expect($product->salesPrices()->whereNull('group_id')->count())->toBe(1)
        ->and($product->salesPrices()->whereNull('group_id')->first()->amount)->toBe('79.99');
});

test('the edit product action rejects two default sales prices with a 422', function () {
    Lattice::actions([EditProductAction::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => '49.99']);

    $ref = componentRef(
        wire(Action::use(EditProductAction::class)
            ->context(['product_id' => $product->getKey()])),
    );

    patchJson('/lattice/actions/workbench.products.edit-modal', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '49.99'],
            ['group_id' => '', 'amount' => '59.99'],
        ],
    ], ['X-Lattice-Ref' => $ref])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['sales_prices']);

    expect($product->salesPrices()->whereNull('group_id')->count())->toBe(1);
});
