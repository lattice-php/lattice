<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('opens an image cell in a lightbox and closes it again', function (): void {
    Product::query()->delete();
    $product = Product::factory()->withImages()->create(['status' => 'active']);

    $page = $this->visitAsWorkbenchUser('/products')
        ->assertSee($product->name)
        ->click('@preview-image')
        ->assertPresent('[data-slot="image-lightbox"]')
        ->click('@lightbox-close');

    retryUntil(function () use ($page): void {
        $page->assertNotPresent('[data-slot="image-lightbox"]');
    });

    $page->assertNoSmoke();
});
