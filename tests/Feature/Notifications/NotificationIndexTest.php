<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Notifications\Notification;
use Workbench\App\Actions\MarkNotificationSeenAction;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

test('index returns the users notifications with an unread count', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('First')->send($user);
    $this->travel(1)->seconds();
    Notification::make()->title('Second')->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('unreadCount', 2)
        ->assertJsonPath('notifications.0.title', 'Second')
        ->assertJsonPath('notifications.1.title', 'First')
        ->assertJsonPath('notifications.0.isRead', false);
});

test('index never leaks another users notifications', function (): void {
    $me = workbenchTestUser();
    $other = workbenchTestUser();
    Notification::make()->title('Theirs')->send($other);

    actingAs($me);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('unreadCount', 0)
        ->assertJsonCount(0, 'notifications');
});

test('index materializes action descriptors into signed action nodes', function (): void {
    Lattice::actions([MarkNotificationSeenAction::class]);
    $user = workbenchTestUser();
    Notification::make()->title('Order shipped')
        ->action(MarkNotificationSeenAction::class, ['order' => 1234])
        ->link('Track', 'https://tracking.test/1234')
        ->send($user);

    actingAs($user);

    getJson('/lattice/notifications')
        ->assertOk()
        ->assertJsonPath('notifications.0.actions.0.type', 'action')
        ->assertJsonPath('notifications.0.actions.1.type', 'link');
});
