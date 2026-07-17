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

it('filters by text and clears via the filter chip', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/');

    $page->fill('@filter-name-value', 'Ada')
        ->keys('@filter-name-value', 'Enter');

    assertDontSeeEventually($page, 'Maya Chen');

    $page->assertSee('Ada Lovelace')
        ->click('@filter-chip-name-remove');

    assertSeeEventually($page, 'Maya Chen');

    $page->assertNoSmoke();
});

it('adds a filter through the column popover', function (): void {
    $this->actingAs(workbenchTestUser());
    seedNamedWorkbenchUsers();

    $page = visit('/');

    $page->assertSee('Ada Lovelace')
        ->click('@filter-name')
        ->fill('[aria-label="Name filter value"]', 'Grace')
        ->keys('[aria-label="Name filter value"]', 'Enter');

    assertDontSeeEventually($page, 'Ada Lovelace');

    $page->assertSee('Grace Hopper')
        ->assertNoSmoke();
});

it('filters products by the boolean featured column', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Featured Item', 'featured' => true]);
    Product::factory()->create(['name' => 'Plain Item', 'featured' => false]);

    $page = visit('/products');

    $page->assertSee('Featured Item')
        ->assertSee('Plain Item')
        ->select('@filter-featured-value', 'true');

    assertDontSeeEventually($page, 'Plain Item');

    $page->assertSee('Featured Item')
        ->assertNoSmoke();
});

it('narrows rows with the ternary featured filter and restores them via reset', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    $page = visit('/products');

    $page->assertSee('Active Featured')
        ->assertSee('Draft Plain')
        ->click('@table-filters-menu')
        ->click('#table-filter-featured-value')
        ->click('[data-test="select-value-option-true"]');

    assertDontSeeEventually($page, 'Draft Plain');

    $page->assertSee('Active Featured')
        ->click('@table-filters-reset');

    assertSeeEventually($page, 'Draft Plain');

    $page->assertNoSmoke();
});

it('narrows rows with a custom toggle filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    $page = visit('/products');

    $page->click('@table-filters-menu')
        ->click('@table-filter-high_value');

    assertDontSeeEventually($page, 'Draft Plain');

    $page->assertSee('Active Featured')
        ->assertNoSmoke();
});

it('narrows rows with the status column select filter', function (): void {
    $this->actingAs(workbenchTestUser());
    seedFilterProducts();

    $page = visit('/products');

    $page->click('#table-filter-status-value')
        ->click('[data-test="select-value-option-active"]');

    assertDontSeeEventually($page, 'Draft Plain');

    $page->assertSee('Active Featured')
        ->assertNoSmoke();
});
