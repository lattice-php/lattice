<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\Notification;
use Lattice\Lattice\Notifications\PendingLatticeNotification;

test('send persists a lattice payload to the native notifications table', function (): void {
    $user = workbenchTestUser();

    Notification::make()->title('Order shipped')->body('On its way')->send($user);

    expect($user->notifications()->count())->toBe(1);

    $row = $user->notifications()->first();
    expect($row->getAttribute('data'))->toMatchArray([
        'format' => 'lattice',
        'title' => 'Order shipped',
        'body' => 'On its way',
    ])->and($row->getAttribute('read_at'))->toBeNull();
});

test('via includes broadcast for send and omits it for sendToDatabase', function (): void {
    $user = workbenchTestUser();

    $broadcasting = new PendingLatticeNotification(Notification::make()->title('x'), broadcast: true);
    $databaseOnly = new PendingLatticeNotification(Notification::make()->title('x'), broadcast: false);

    expect($broadcasting->via($user))->toBe(['database', 'broadcast'])
        ->and($databaseOnly->via($user))->toBe(['database']);
});
