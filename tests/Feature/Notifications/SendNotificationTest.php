<?php
declare(strict_types=1);

use Lattice\Lattice\Notifications\LatticeNotification;
use Lattice\Lattice\Notifications\Notification;

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

test('send persists a translatable title and body as their wire shape', function (): void {
    $user = workbenchTestUser();

    Notification::make()
        ->title(rt('orders.shipped.title'))
        ->body(rt('orders.shipped.body')->with(['order' => 1234]))
        ->send($user);

    $data = $user->notifications()->first()->getAttribute('data');

    expect($data['title'])->toBe(['key' => 'orders.shipped.title', 'payload' => [], 'replacements' => []])
        ->and($data['body'])->toBe(['key' => 'orders.shipped.body', 'payload' => [], 'replacements' => ['order' => 1234]]);
});

test('via includes broadcast for send and omits it for sendToDatabase', function (): void {
    $user = workbenchTestUser();

    $broadcasting = new LatticeNotification(Notification::make()->title('x'), broadcast: true);
    $databaseOnly = new LatticeNotification(Notification::make()->title('x'), broadcast: false);

    expect($broadcasting->via($user))->toBe(['database', 'broadcast'])
        ->and($databaseOnly->via($user))->toBe(['database']);
});
