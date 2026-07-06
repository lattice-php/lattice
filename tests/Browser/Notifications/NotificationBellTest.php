<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\Notification;

it('shows the bell, opens the panel, and marks notifications read', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('Order #1234 shipped')->body('Tracking is available')->icon('bell')->send($user);

    $this->actingAs($user);

    visit('/')
        ->assertPresent('@notifications-trigger')
        ->assertPresent('[data-test="notifications-badge"]')
        ->assertSeeIn('[data-test="notifications-badge"]', '1')
        ->click('@notifications-trigger')
        ->assertSee('Order #1234 shipped')
        ->click('Mark all read')
        ->assertNotPresent('[data-test="notifications-badge"]')
        ->assertNoSmoke();
});

it('renders the slide-out variant when configured', function (): void {
    // Requires a workbench route/layout variant using Notifications::make()->slideOut();
    // add a dedicated workbench demo page if AppLayout uses the default popover bell.
})->todo();
