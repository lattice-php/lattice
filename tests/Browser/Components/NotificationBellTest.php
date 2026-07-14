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
    $user = workbenchTestUser();

    Notification::make()
        ->title('Slide out notice')
        ->body('This notification opens inside the slide-out panel.')
        ->sendToDatabase($user);

    $this->actingAs($user);

    $page = visit('/components/notifications?mode=slide-out')
        ->assertSee('The bell opens notifications in a slide-out panel.')
        ->click('@notifications-trigger');

    eventually(function () use ($page): void {
        $page
            ->assertVisible('[data-slot="dialog-overlay"]')
            ->assertVisible('[data-slot="dialog-content"]')
            ->assertNotPresent('[data-slot="popover-content"]')
            ->assertVisible('@notifications-panel')
            ->assertSee('Slide out notice')
            ->assertSee('This notification opens inside the slide-out panel.');
    });

    $page->assertNoSmoke();
});
