<?php
declare(strict_types=1);

it('blocks advancing while the step is invalid and shows inline errors', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/wizard');

    $page->assertSee('Checkout wizard')
        ->click('@wizard-next');

    assertSeeEventually($page, 'The Name field is required.');

    $page->assertPresent('@wizard-next')
        ->assertMissing('@wizard-finish')
        ->assertNoSmoke();
});

it('advances on a valid step and preserves values when navigating back', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/wizard');

    $page->fill('@name', 'Taylor')
        ->fill('@email', 'taylor@example.com')
        ->click('@wizard-next');

    assertSeeEventually($page, 'SKU');

    $page->click('@wizard-back')
        ->assertValue('name', 'Taylor')
        ->assertValue('email', 'taylor@example.com')
        ->assertNoSmoke();
});

it('walks all steps and submits the accumulated state on finish', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/wizard');

    $page->fill('@name', 'Taylor')
        ->fill('@email', 'taylor@example.com')
        ->click('@wizard-next');

    assertSeeEventually($page, 'SKU');

    $page->fill('@sku', 'SKU-1')
        ->fill('@qty', '2')
        ->click('@wizard-next');

    assertSeeEventually($page, 'Review your input');

    $page->click('@wizard-finish');

    assertSeeEventually($page, 'Order placed.');

    $page->assertNoSmoke();
});

it('lets the rail jump back to a visited step but not ahead', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/wizard');

    $page->assertPresent('[data-test="wizard-rail-review"][disabled]')
        ->fill('@name', 'Taylor')
        ->fill('@email', 'taylor@example.com')
        ->click('@wizard-next');

    assertSeeEventually($page, 'SKU');

    $page->click('@wizard-rail-customer')
        ->assertValue('name', 'Taylor')
        ->assertNoSmoke();
});
