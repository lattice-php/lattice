<?php
declare(strict_types=1);

it('keeps the confirm dialog open and shows an error toast when an action is rejected', function (): void {
    deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products');

    $page->click('@product-actions')
        ->click('@action-fail-demo')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Could not process the request.');

    $page->assertVisible('@confirm-accept')
        ->assertSee('Fail demo?')
        ->assertNoSmoke();
});
