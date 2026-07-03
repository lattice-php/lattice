<?php
declare(strict_types=1);

it('renders the charts gallery with every demo chart', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/charts')
        ->assertSee('Chart gallery')
        ->assertSee('Signups')
        ->assertSee('Orders by channel')
        ->assertSee('Traffic')
        ->assertSee('Revenue (formatted)')
        ->assertSee('Conversion rate')
        ->assertPresent('[data-lattice-fragment="workbench.sales-mix-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.order-volume-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.revenue-trend-chart"]')
        ->assertNoSmoke();
});

it('switches appearance to dark from the topbar switcher', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/charts')
        ->assertSee('Chart gallery')
        ->click('@appearance-dark')
        ->assertPresent('html.dark')
        ->assertNoSmoke();
});
