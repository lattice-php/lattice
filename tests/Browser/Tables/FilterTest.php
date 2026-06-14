<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('filters by text and clears via the filter chip', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->fill('@filter-name-value', 'Ada')
        ->keys('@filter-name-value', 'Enter')
        ->assertSee('Ada Lovelace')
        ->assertDontSee('Maya Chen')
        ->click('@filter-chip-name-remove')
        ->assertSee('Maya Chen')
        ->assertNoSmoke();
});

it('adds a filter through the column popover', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->click('@filter-name')
        ->fill('[aria-label="Name filter value"]', 'Grace')
        ->keys('[aria-label="Name filter value"]', 'Enter')
        ->assertSee('Grace Hopper')
        ->assertDontSee('Ada Lovelace')
        ->assertNoSmoke();
});

it('filters products by the boolean featured column', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Featured Item', 'featured' => true]);
    Product::factory()->create(['name' => 'Plain Item', 'featured' => false]);

    visit('/products')
        ->assertSee('Featured Item')
        ->assertSee('Plain Item')
        ->select('@filter-featured-value', 'true')
        ->assertSee('Featured Item')
        ->assertDontSee('Plain Item')
        ->assertNoSmoke();
});
