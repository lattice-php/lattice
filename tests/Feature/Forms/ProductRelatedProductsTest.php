<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ProductForm;
use Workbench\App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('the product form syncs related products on create', function (): void {
    Lattice::forms([ProductForm::class]);

    $alpha = Product::factory()->create(['name' => 'Alpha']);
    $beta = Product::factory()->create(['name' => 'Beta']);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Gadget',
        'sku' => 'GAD-001',
        'status' => 'active',
        'related_products' => [$alpha->getKey(), $beta->getKey()],
    ], $this->latticeHeaders($form))
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'GAD-001')->firstOrFail();

    expect($product->relatedProducts->pluck('id')->all())
        ->toEqualCanonicalizing([$alpha->getKey(), $beta->getKey()]);
});

test('the product form replaces related products on update', function (): void {
    Lattice::forms([ProductForm::class]);

    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);
    $alpha = Product::factory()->create(['name' => 'Alpha']);
    $beta = Product::factory()->create(['name' => 'Beta']);
    $gamma = Product::factory()->create(['name' => 'Gamma']);

    $product->relatedProducts()->sync([$alpha->getKey(), $beta->getKey()]);

    $form = wire(Form::use(ProductForm::class)
        ->context(['product_id' => $product->getKey()]));

    patch('/lattice/forms/workbench.products.form', [
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
        'related_products' => [$gamma->getKey()],
    ], $this->latticeHeaders($form))
        ->assertRedirect('/products');

    expect($product->fresh()->relatedProducts->pluck('id')->all())
        ->toBe([$gamma->getKey()]);
});

test('the product form ignores related ids that do not exist', function (): void {
    Lattice::forms([ProductForm::class]);

    $alpha = Product::factory()->create(['name' => 'Alpha']);

    $form = wire(Form::use(ProductForm::class));

    post('/lattice/forms/workbench.products.form', [
        'name' => 'Gadget',
        'sku' => 'GAD-002',
        'status' => 'active',
        'related_products' => [$alpha->getKey(), 999999],
    ], $this->latticeHeaders($form))
        ->assertRedirect('/products');

    $product = Product::query()->where('sku', 'GAD-002')->firstOrFail();

    expect($product->relatedProducts->pluck('id')->all())->toBe([$alpha->getKey()]);
});

test('the product edit page binds related product ids into form state', function (): void {
    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'draft',
    ]);
    $related = Product::factory()->create(['name' => 'Walnut Desk']);
    $product->relatedProducts()->sync([$related->getKey()]);

    withoutVite();
    $this->actingAs(workbenchTestUser());

    $this->assertLatticePage(get("/products/{$product->getKey()}/edit")->assertOk())
        ->form('workbench.products.form', fn ($form) => $form
            ->field('related_products', fn ($field) => $field
                ->assertInitialValue([$related->getKey()])));
});

test('the product form resolves related product labels for prefilled ids', function (): void {
    Lattice::forms([ProductForm::class]);

    $related = Product::factory()->create(['name' => 'Walnut Desk']);

    $form = wire(Form::use(ProductForm::class)
        ->fill(['related_products' => [$related->getKey()]]));

    expect(json_encode($form))
        ->toContain('{"label":"Walnut Desk","value":"'.$related->getKey().'"}');
});
