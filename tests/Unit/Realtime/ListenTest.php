<?php
declare(strict_types=1);

use Lattice\Lattice\Realtime\Listen;

test('it serializes channel, visibility, events and a toast effect', function (): void {
    $listen = Listen::private('orders')
        ->on('OrderShipped')
        ->toast(rt('orders.shipped-live')->fromPayload(['id' => 'order.id']));

    $array = wire($listen);

    expect($array)->toMatchArray([
        'channel' => 'orders',
        'visibility' => 'private',
        'events' => ['OrderShipped'],
    ]);

    expect($array['effects'][0])->toMatchArray(['type' => 'toast']);
    expect($array['effects'][0]['toast']['message'])->toBe([
        'key' => 'orders.shipped-live',
        'payload' => ['id' => 'order.id'],
        'replacements' => [],
    ]);
});

test('channel() builds a public listener and on() accepts an array, de-duplicating', function (): void {
    $listen = Listen::channel('inventory')->on(['StockLow', 'StockLow', 'StockOut'])->reloadPage();

    $array = wire($listen);

    expect($array['visibility'])->toBe('public')
        ->and($array['events'])->toBe(['StockLow', 'StockOut'])
        ->and($array['effects'][0]['type'])->toBe('reload-page');
});

test('presence() builds a presence listener', function (): void {
    $array = wire(Listen::presence('room.1')->on('Joined'));

    expect($array['visibility'])->toBe('presence');
});
