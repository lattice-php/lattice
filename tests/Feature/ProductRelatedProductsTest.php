<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('the product form syncs related products on create', function () {
    Lattice::forms([ProductForm::class]);

    $alpha = Product::factory()->create(['name' => 'Alpha']);
    $beta = Product::factory()->create(['name' => 'Beta']);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Gadget',
        'sku' => 'GAD-001',
        'price' => '10.00',
        'status' => 'active',
        'related_products' => [$alpha->getKey(), $beta->getKey()],
    ], ['X-Lattice-Ref' => $form['props']['ref']])
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'GAD-001')->firstOrFail();

    expect($product->relatedProducts->pluck('id')->all())
        ->toEqualCanonicalizing([$alpha->getKey(), $beta->getKey()]);
});

test('the product form replaces related products on update', function () {
    Lattice::forms([ProductForm::class]);

    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
    ]);
    $alpha = Product::factory()->create(['name' => 'Alpha']);
    $beta = Product::factory()->create(['name' => 'Beta']);
    $gamma = Product::factory()->create(['name' => 'Gamma']);

    $product->relatedProducts()->sync([$alpha->getKey(), $beta->getKey()]);

    $form = Form::use(ProductForm::class)
        ->context(['product_id' => $product->getKey()])
        ->toArray();

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
        'related_products' => [$gamma->getKey()],
    ], ['X-Lattice-Ref' => $form['props']['ref']])
        ->assertRedirect('/products');

    expect($product->fresh()->relatedProducts->pluck('id')->all())
        ->toBe([$gamma->getKey()]);
});

test('the product form ignores related ids that do not exist', function () {
    Lattice::forms([ProductForm::class]);

    $alpha = Product::factory()->create(['name' => 'Alpha']);

    $form = Form::use(ProductForm::class)->toArray();

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Gadget',
        'sku' => 'GAD-002',
        'price' => '10.00',
        'status' => 'active',
        'related_products' => [$alpha->getKey(), 999999],
    ], ['X-Lattice-Ref' => $form['props']['ref']])
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'GAD-002')->firstOrFail();

    expect($product->relatedProducts->pluck('id')->all())->toBe([$alpha->getKey()]);
});

test('the product edit page binds related product ids into form state', function () {
    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'draft',
    ]);
    $related = Product::factory()->create(['name' => 'Walnut Desk']);
    $product->relatedProducts()->sync([$related->getKey()]);

    withoutVite();

    get("/products/{$product->getKey()}/edit")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page', false)
            ->where('lattice.schema.0.schema.1.props.state.related_products', [$related->getKey()])
        );
});

test('the product form resolves related product labels for prefilled ids', function () {
    Lattice::forms([ProductForm::class]);

    $related = Product::factory()->create(['name' => 'Walnut Desk']);

    $form = Form::use(ProductForm::class)
        ->fill(['related_products' => [$related->getKey()]])
        ->toArray();

    expect(json_encode($form))
        ->toContain('{"label":"Walnut Desk","value":"'.$related->getKey().'"}');
});
