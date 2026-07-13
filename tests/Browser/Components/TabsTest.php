<?php
declare(strict_types=1);

it('switches horizontal and vertical tabs end to end', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/components/tabs')
        ->assertSee('Horizontal tabs')
        ->assertSee('Vertical tabs')
        ->assertPresent('[role="tablist"][aria-orientation="horizontal"]')
        ->assertPresent('[role="tablist"][aria-orientation="vertical"]')
        ->assertPresent('[data-lattice-tabs="centered-tabs"] [role="tablist"].justify-self-center')
        ->assertPresent('[data-lattice-tabs="vertical-end-tabs"].flex-row-reverse')
        ->assertSee('Overview panel')
        ->assertSee('Account panel')
        ->assertDontSee('Details panel')
        ->assertDontSee('Security panel')
        ->click('@tab-details')
        ->assertSee('Details panel')
        ->click('@tab-security')
        ->assertSee('Security panel')
        ->assertNoSmoke();
});
