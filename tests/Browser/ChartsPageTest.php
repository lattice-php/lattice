<?php
declare(strict_types=1);

it('loads chart examples through lazy fragments', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/charts')
        ->assertSee('Workbench charts')
        ->assertPresent('[data-lattice-fragment="workbench.revenue-trend-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.sales-mix-chart"]')
        ->assertPresent('[data-lattice-fragment="workbench.order-volume-chart"]')
        ->assertSee('Revenue trend')
        ->assertSee('Sales mix')
        ->assertSee('Order volume')
        ->assertNoSmoke();
});
