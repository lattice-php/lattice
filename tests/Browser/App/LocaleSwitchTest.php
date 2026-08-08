<?php
declare(strict_types=1);

it('switches the server-driven UI language in place when the locale changes', function (): void {
    deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products')
        ->assertSee('Updated at')
        ->click('@locale-switcher')
        ->click('@locale-de');

    retryUntil(function () use ($page): void {
        $page
            ->assertSee('Aktualisiert am')
            ->assertDontSee('Updated at');
    });

    $page
        ->assertNoSmoke();
});
