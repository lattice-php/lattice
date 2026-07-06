<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Notifications\Notification;

test('the builder produces a self-describing lattice payload', function (): void {
    $payload = Notification::make()
        ->title('Order #1234 shipped')
        ->body('Tracking is now available.')
        ->icon('truck')
        ->variant(Variant::Success)
        ->href('/orders/1234')
        ->toArray();

    expect($payload)->toBe([
        'format' => 'lattice',
        'title' => 'Order #1234 shipped',
        'body' => 'Tracking is now available.',
        'icon' => 'truck',
        'variant' => 'success',
        'href' => '/orders/1234',
        'openInNewTab' => false,
        'actions' => [],
    ]);
});

test('optional fields are null and openInNewTab reflects the flag', function (): void {
    $payload = Notification::make()->title('Ping')->href('https://x.test', newTab: true)->toArray();

    expect($payload)->toMatchArray([
        'title' => 'Ping',
        'body' => null,
        'icon' => null,
        'variant' => 'info',
        'href' => 'https://x.test',
        'openInNewTab' => true,
    ]);
});
