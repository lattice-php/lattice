<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\Notification;

it('shows the bell, opens the panel, and marks notifications read', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('Order #1234 shipped')->body('Tracking is available')->icon('bell')->send($user);

    $this->actingAs($user);

    visit('/')
        ->assertPresent('[data-test="notifications-trigger"]')
        ->assertSee('1')
        ->click('[data-test="notifications-trigger"]')
        ->assertSee('Order #1234 shipped')
        ->click('Mark all read')
        ->assertDontSee('Mark all read')
        ->assertNoSmoke();
});

it('renders the slide-out variant when configured', function (): void {
    // Requires a workbench route/layout variant using Notifications::make()->slideOut();
    // add a dedicated workbench demo page if AppLayout uses the default popover bell.
})->todo();
