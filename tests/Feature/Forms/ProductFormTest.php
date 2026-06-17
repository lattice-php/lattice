<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Testing\Assertions\FieldAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Actions\EditProductAction;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\File;
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

test('forms serialize initial state for bound edit values', function (): void {
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
        ->form('product-form', fn (FormAssertions $f): FieldAssertions => $f
            ->field('name')->assertInitialValue('Desk Lamp'));

    expect(wire($form)['props']['state'])->toBe([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
    ]);
});

test('forms can enable precognitive validation with a delay', function (): void {
    $form = wire(Form::make('product-form')
        ->precognitive(650));

    expect($form['props']['precognitive'])->toBeTrue()
        ->and($form['props']['validationTimeout'])->toBe(650);
});

test('the product index page lists products and links to creation', function (): void {
    Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/products')->assertOk();

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->component('lattice/page', false)
        ->where('lattice.title', 'Products'));

    $this->assertLatticePage($response)
        ->component('button', 'create-product', fn ($button) => $button->assertProp('href', '/products/create'))
        ->component('table', 'workbench.products', fn ($table) => $table->assertProp('data.0.name', 'Desk Lamp'));
});

test('the product form creates products', function (): void {
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

test('the product form creates product images from signed uploads', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/lamp.jpg', 'image-data');
    Lattice::forms([ProductForm::class]);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'images' => ['tmp/lamp.jpg'],
    ], productHeaders($form))
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'LAMP-001')->firstOrFail();
    $image = $product->images()->firstOrFail();

    expect($image->disk)->toBe('s3')
        ->and($image->path)->toStartWith('workbench/products/lamp-001-')
        ->and($image->path)->toEndWith('.jpg')
        ->and($image->name)->toBe(basename($image->path))
        ->and($image->mime_type)->toBe('image/jpeg')
        ->and($image->size)->toBe(10)
        ->and(DB::table('attachments')
            ->where('file_id', $image->getKey())
            ->where('attachable_type', Product::class)
            ->where('attachable_id', $product->getKey())
            ->value('sort_order'))->toBe(1);

    Storage::disk('s3')->assertMissing('tmp/lamp.jpg');
    Storage::disk('s3')->assertExists($image->path);
});

test('the product edit page binds existing product state', function (): void {
    Storage::fake('s3');
    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);
    $product->salesPrices()->create(['group_id' => null, 'amount' => '49.99']);
    Storage::disk('s3')->put('workbench/products/lamp.jpg', 'image-data');
    $image = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/lamp.jpg',
        'name' => 'lamp.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 10,
    ]);
    $product->images()->attach($image->getKey(), ['sort_order' => 1]);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get("/products/{$product->getKey()}/edit")->assertOk();

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->component('lattice/page', false)
        ->where('lattice.title', 'Edit Product'));

    $this->assertLatticePage($response)
        ->component('form', 'workbench.products.form', fn ($form) => $form->assertProps([
            'method' => 'patch',
            'submitLabel' => 'Save product',
            'state.name' => 'Desk Lamp',
            'state.sku' => 'LAMP-001',
            'state.images.0' => 'workbench/products/lamp.jpg',
            'state.sales_prices.0.amount' => '49.99',
            'state.sales_prices.0.group_id' => '',
            'state.status' => 'draft',
        ]));
});

test('the product form updates the trusted product from sealed context', function (): void {
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

test('the product form updates product images from signed uploads and removals', function (): void {
    Storage::fake('s3');
    Lattice::forms([ProductForm::class]);

    $product = Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);

    Storage::disk('s3')->put('workbench/products/old.jpg', 'old-image');
    Storage::disk('s3')->put('workbench/products/keep.jpg', 'keep-image');
    Storage::disk('s3')->put('tmp/new.jpg', 'new-image');

    $oldImage = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/old.jpg',
        'name' => 'old.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 9,
    ]);
    $keptImage = File::factory()->create([
        'disk' => 's3',
        'path' => 'workbench/products/keep.jpg',
        'name' => 'keep.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 10,
    ]);
    $product->images()->attach([
        $oldImage->getKey() => ['sort_order' => 1],
        $keptImage->getKey() => ['sort_order' => 2],
    ]);

    $removedToken = app(SignsComponentReferences::class)
        ->seal('file', 'images', ['disk' => 's3', 'path' => 'workbench/products/old.jpg']);
    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $product->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Updated Lamp',
        'sku' => 'LAMP-002',
        'status' => 'active',
        'images' => ['tmp/new.jpg'],
        'images__removed' => [$removedToken],
    ], productHeaders($form))
        ->assertRedirect('/products');

    $product->refresh();
    $newImage = $product->images()
        ->where('files.path', 'like', 'workbench/products/lamp-002-%')
        ->firstOrFail();

    expect($product->images()->pluck('files.path')->all())->toHaveCount(2)
        ->and($product->images()->pluck('files.path')->all())->toContain('workbench/products/keep.jpg')
        ->and($newImage->path)->toEndWith('.jpg')
        ->and(DB::table('attachments')
            ->where('file_id', $newImage->getKey())
            ->where('attachable_type', Product::class)
            ->where('attachable_id', $product->getKey())
            ->value('sort_order'))->toBe(3)
        ->and(File::query()->whereKey($oldImage->getKey())->exists())->toBeFalse();

    Storage::disk('s3')->assertMissing('workbench/products/old.jpg');
    Storage::disk('s3')->assertExists('workbench/products/keep.jpg');
    Storage::disk('s3')->assertMissing('tmp/new.jpg');
    Storage::disk('s3')->assertExists($newImage->path);
});

test('the product form validates required fields', function (): void {
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

test('the product form returns precognitive validation errors without creating products', function (): void {
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

test('the product form accepts valid precognitive validation without creating products', function (): void {
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

test('the product form validates edit uniqueness from sealed context during precognition', function (): void {
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

test('the product form create rejects two default sales prices', function (): void {
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

test('the product form update rejects two default sales prices', function (): void {
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

test('the edit product action syncs sales prices', function (): void {
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

test('the edit product action syncs images', function (): void {
    Storage::fake('s3');
    Storage::disk('s3')->put('tmp/modal.jpg', 'image-data');
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
        'images' => ['tmp/modal.jpg'],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['X-Lattice-Ref' => $ref])
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
    $ref = componentRef(
        wire(Action::use(EditProductAction::class)
            ->context(['product_id' => $product->getKey()])),
    );

    patchJson('/lattice/actions/workbench.products.edit-modal', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
        'related_products' => [],
        'images' => [],
        'images__removed' => [$removedToken],
        'sales_prices' => [
            ['group_id' => '', 'amount' => '79.99'],
        ],
    ], ['X-Lattice-Ref' => $ref])
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
