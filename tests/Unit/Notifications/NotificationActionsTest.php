<?php

declare(strict_types=1);

use Lattice\Lattice\Notifications\Notification;

test('actions serialize as descriptors, never as signed nodes', function (): void {
    $actions = Notification::make()
        ->title('Order shipped')
        ->action('mark-order-seen', ['order' => 1234], label: 'Mark seen')
        ->link('Track', 'https://tracking.test/1234', newTab: true)
        ->toArray()['actions'];

    expect($actions)->toBe([
        ['kind' => 'action', 'name' => 'mark-order-seen', 'arguments' => ['order' => 1234], 'label' => 'Mark seen'],
        ['kind' => 'link', 'label' => 'Track', 'url' => 'https://tracking.test/1234', 'newTab' => true],
    ]);
});
