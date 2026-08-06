<?php

declare(strict_types=1);

it('renders a component contributed by a third-party Composer package', function (): void {
    $this->visitAsWorkbenchUser('/platform/package')
        ->assertVisible('[data-test="signature-pad"]:has-text("Vendor component rendered")')
        ->assertVisible('[data-test="signature-pad"]:has-text("Sign here")')
        ->assertVisible('[data-test="signature-pad"]:has-text("Vendor component rendered") [data-test="signature-icon"]')
        ->assertMissing('[data-test="signature-pad"]:has-text("Vendor component rendered") [data-test="signature-css-probe"]')
        ->assertMissing('[data-test="signature-pad"]:has-text("Vendor component rendered") [data-test="signature-scan-probe"]')
        ->assertNoSmoke();
});
