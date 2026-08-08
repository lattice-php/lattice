<?php
declare(strict_types=1);

it('loads dashboard chart examples through lazy fragments', function (): void {
    $this->visitAsWorkbenchUser('/')
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
    $page = $this->visitAsWorkbenchUser('/')
        ->click('@locale-switcher')
        ->click('@locale-de');

    assertSeeEventually($page, 'Umsatztrend');

    $page
        ->assertSee('Dashboard-Diagramme')
        ->assertDontSee('Revenue trend')
        ->assertNoSmoke();
});
