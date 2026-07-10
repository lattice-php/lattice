<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('hides a column from the menu and remembers it across reloads', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    $page = visit('/products');

    $page->assertSee('LAMP-1')
        ->click('@table-columns-menu')
        ->click('@table-column-toggle-sku');

    eventually(function () use ($page): void {
        $page->assertDontSee('LAMP-1');
    });

    $page->assertSee('Desk Lamp')
        ->assertNoSmoke()
        ->refresh();

    eventually(function () use ($page): void {
        $page->assertDontSee('LAMP-1');
    });

    $page->assertSee('Desk Lamp')
        ->assertNoSmoke();
});

it('does not show the columns menu when no column is toggleable', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->assertSee('Maya Chen')
        ->assertMissing('@table-columns-menu')
        ->assertNoSmoke();
});
