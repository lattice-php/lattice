<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('switches the server-driven UI language in place when the locale changes', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->assertSee('Updated at')
        ->click('@locale-de')
        ->assertSee('Aktualisiert am')
        ->assertDontSee('Updated at')
        ->assertNoSmoke();
});
