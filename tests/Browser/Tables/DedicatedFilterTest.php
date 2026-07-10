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

    $page = visit('/products');

    $page->assertSee('Active Featured')
        ->assertSee('Draft Plain')
        ->click('@table-filters-menu')
        ->click('#table-filter-featured-value')
        ->click('[data-test="select-value-option-true"]');

    eventually(function () use ($page): void {
        $page->assertDontSee('Draft Plain');
    });

    $page->assertSee('Active Featured')
        ->click('@table-filters-reset');

    eventually(function () use ($page): void {
        $page->assertSee('Draft Plain');
    });

    $page->assertNoSmoke();
});

it('narrows rows with a custom toggle filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    $page = visit('/products');

    $page->click('@table-filters-menu')
        ->click('@table-filter-high_value');

    eventually(function () use ($page): void {
        $page->assertDontSee('Draft Plain');
    });

    $page->assertSee('Active Featured')
        ->assertNoSmoke();
});

it('narrows rows with the status column select filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    $page = visit('/products');

    $page->click('#table-filter-status-value')
        ->click('[data-test="select-value-option-active"]');

    eventually(function () use ($page): void {
        $page->assertDontSee('Draft Plain');
    });

    $page->assertSee('Active Featured')
        ->assertNoSmoke();
});
