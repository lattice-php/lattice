<?php
declare(strict_types=1);

use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Models\Product;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

test('the workbench product provider returns matching products', function () {
    Product::factory()->create(['name' => 'Aurora Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);
    Product::factory()->create(['name' => 'Borealis Chair', 'sku' => 'CHAIR-1', 'status' => 'active']);

    actingAs(UserFactory::new()->create());

    $response = getJson('/lattice/global-search?query=Aurora&category=products&counts=1');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.item.title'))->toContain('Aurora')
        ->and($response->json('data.0.category.name'))->toBe('products');
});
