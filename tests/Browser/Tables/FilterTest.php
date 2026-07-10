<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('filters by text and clears via the filter chip', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/');

    $page->fill('@filter-name-value', 'Ada')
        ->keys('@filter-name-value', 'Enter');

    eventually(function () use ($page): void {
        $page->assertDontSee('Maya Chen');
    });

    $page->assertSee('Ada Lovelace')
        ->click('@filter-chip-name-remove');

    eventually(function () use ($page): void {
        $page->assertSee('Maya Chen');
    });

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

    eventually(function () use ($page): void {
        $page->assertDontSee('Ada Lovelace');
    });

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

    eventually(function () use ($page): void {
        $page->assertDontSee('Plain Item');
    });

    $page->assertSee('Featured Item')
        ->assertNoSmoke();
});
