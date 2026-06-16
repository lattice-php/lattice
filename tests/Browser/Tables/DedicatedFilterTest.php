<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

function seedFilterProducts(): void
{
    Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Active Featured',
        'status' => 'active',
        'featured' => true,
    ])->salesPrices()->create(['group_id' => null, 'amount' => '1500.00']);

    Product::factory()->withoutDefaultPrice()->create([
        'name' => 'Draft Plain',
        'status' => 'draft',
        'featured' => false,
    ])->salesPrices()->create(['group_id' => null, 'amount' => '50.00']);
}

it('narrows rows with the ternary featured filter and restores them via reset', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    visit('/products')
        ->assertSee('Active Featured')
        ->assertSee('Draft Plain')
        ->click('@table-filters-menu')
        ->select('@table-filter-featured', 'true')
        ->assertSee('Active Featured')
        ->assertDontSee('Draft Plain')
        ->click('@table-filters-reset')
        ->assertSee('Draft Plain')
        ->assertNoSmoke();
});

it('narrows rows with a custom toggle filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    visit('/products')
        ->click('@table-filters-menu')
        ->click('@table-filter-high_value')
        ->assertSee('Active Featured')
        ->assertDontSee('Draft Plain')
        ->assertNoSmoke();
});

it('narrows rows with the status column select filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    visit('/products')
        ->select('@table-filter-status', 'active')
        ->assertSee('Active Featured')
        ->assertDontSee('Draft Plain')
        ->assertNoSmoke();
});
