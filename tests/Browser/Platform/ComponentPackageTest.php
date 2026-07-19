<?php

declare(strict_types=1);

it('renders a component contributed by a third-party Composer package', function (): void {
    $this->visitAsWorkbenchUser('/platform/package')
        ->assertSee('Vendor component rendered')
        ->assertVisible('[data-test="signature-pad"]')
        ->assertNoSmoke();
});
