<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\Notification;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\patchJson;
use function Pest\Laravel\postJson;

test('a user can mark a single notification read', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('One')->send($user);
    $id = $user->notifications()->first()->id;

    actingAs($user);

    patchJson("/lattice/notifications/{$id}/read")
        ->assertOk()
        ->assertJsonPath('unreadCount', 0);

    expect($user->notifications()->first()->read_at)->not->toBeNull();
});

test('a user can mark all notifications read', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('One')->send($user);
    Notification::make()->title('Two')->send($user);

    actingAs($user);

    postJson('/lattice/notifications/read-all')
        ->assertOk()
        ->assertJsonPath('unreadCount', 0);

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('a user can dismiss and clear notifications', function (): void {
    $user = workbenchTestUser();
    Notification::make()->title('One')->send($user);
    Notification::make()->title('Two')->send($user);
    $id = $user->notifications()->first()->id;

    actingAs($user);

    deleteJson("/lattice/notifications/{$id}")->assertOk();
    expect($user->notifications()->count())->toBe(1);

    deleteJson('/lattice/notifications')->assertOk()->assertJsonPath('unreadCount', 0);
    expect($user->notifications()->count())->toBe(0);
});

test('a user cannot mutate another users notification', function (): void {
    $me = workbenchTestUser();
    $other = workbenchTestUser();
    Notification::make()->title('Theirs')->send($other);
    $id = $other->notifications()->first()->id;

    actingAs($me);

    patchJson("/lattice/notifications/{$id}/read")->assertNotFound();
    deleteJson("/lattice/notifications/{$id}")->assertNotFound();
    expect($other->notifications()->first()->read_at)->toBeNull();
});
