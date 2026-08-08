<?php
declare(strict_types=1);

it('shows a toast after an action and dismisses it', function (): void {
    deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products');

    $page->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Product archived.');

    $page->click('@toast-dismiss');

    assertDontSeeEventually($page, 'Product archived.');

    $page->assertNoSmoke();
});

it('renders a link inside a toast', function (): void {
    deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products');

    $page->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Product archived.');

    $page->click('@view-products');

    assertSeeEventually($page, 'Create product');

    $page->assertNoSmoke();
});
