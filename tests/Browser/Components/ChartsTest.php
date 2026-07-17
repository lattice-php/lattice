<?php
declare(strict_types=1);

it('loads dashboard chart examples through lazy fragments', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->assertSee('Workbench page')
        ->assertSee('Dashboard charts')
        ->assertPresent('[data-lattice-fragment="workbench.revenue-trend-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.sales-mix-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.order-volume-chart"]')
        ->assertSee('Revenue trend')
        ->assertSee('Sales mix')
        ->assertSee('Order volume')
        ->assertNoSmoke();
});

it('translates dashboard chart examples in lazy fragments', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/')
        ->click('@locale-switcher')
        ->click('@locale-de');

    assertSeeEventually($page, 'Umsatz');

    $page
        ->assertSee('Dashboard-Diagramme')
        ->assertSee('Umsatztrend')
        ->assertSee('Prognose')
        ->assertSee('Direkt')
        ->assertSee('Auftragsvolumen')
        ->assertDontSee('Revenue trend')
        ->assertNoSmoke();
});

it('renders the charts gallery with every demo chart', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/components/charts')
        ->assertSee('Chart gallery')
        ->assertSee('Signups')
        ->assertSee('Orders by channel')
        ->assertSee('Traffic')
        ->assertSee('Revenue (formatted)')
        ->assertSee('Conversion rate')
        ->assertSee('CPU usage')
        ->assertSee('Channel share')
        ->assertPresent('[data-lattice-fragment="workbench.sales-mix-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.order-volume-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.revenue-trend-chart"]')
        ->assertNoSmoke();
});

it('switches appearance to dark from the topbar switcher', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/components/charts')
        ->assertSee('Chart gallery')
        ->click('@appearance-dark')
        ->assertPresent('html.dark')
        ->assertNoSmoke();
});
