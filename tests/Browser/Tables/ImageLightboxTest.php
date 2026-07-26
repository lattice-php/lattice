<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('opens an image cell in a lightbox and closes it again', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::query()->delete();
    $product = Product::factory()->withImages()->create(['status' => 'active']);

    $page = visit('/products')
        ->assertSee($product->name)
        ->click('@preview-image')
        ->assertPresent('[data-slot="image-lightbox"]')
        ->click('@lightbox-close');

    retryUntil(function () use ($page): void {
        $page->assertNotPresent('[data-slot="image-lightbox"]');
    });

    $page->assertNoSmoke();
});
