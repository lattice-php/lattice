<?php
declare(strict_types=1);

use Lattice\Lattice\Realtime\Listen;

test('it serializes channel, visibility, events and a toast effect', function (): void {
    $listen = Listen::private('orders')
        ->on('OrderShipped')
        ->toast(rt('orders.shipped-live')->fromPayload(['id' => 'order.id']));

    $array = json_decode(json_encode($listen), true);

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

    $array = json_decode(json_encode($listen), true);

    expect($array['visibility'])->toBe('public')
        ->and($array['events'])->toBe(['StockLow', 'StockOut'])
        ->and($array['effects'][0]['type'])->toBe('reloadPage');
});

test('presence() builds a presence listener', function (): void {
    $array = json_decode(json_encode(Listen::presence('room.1')->on('Joined')), true);

    expect($array['visibility'])->toBe('presence');
});
