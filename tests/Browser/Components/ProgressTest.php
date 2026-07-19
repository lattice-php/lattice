<?php
declare(strict_types=1);

it('renders progress bars and circles', function (): void {
    $this->visitAsWorkbenchUser('/components/progress')
        ->assertSee('Progress bars')
        ->assertSee('Progress circles')
        ->assertPresent('[data-lattice-progress="bar"]')
        ->assertPresent('[data-lattice-progress="circle"] svg')
        ->assertSee('50%')
        ->assertNoSmoke();
});
