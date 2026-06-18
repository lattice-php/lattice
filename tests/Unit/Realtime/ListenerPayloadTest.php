<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Realtime\Enums\ChannelVisibility;
use Lattice\Lattice\Realtime\ListenerPayload;

test('it serializes a listener payload with the visibility enum value', function (): void {
    $payload = new ListenerPayload('orders', ChannelVisibility::Private, ['OrderShipped'], [Effect::reloadPage()]);

    $array = wire($payload);

    expect($array)->toMatchArray([
        'channel' => 'orders',
        'visibility' => 'private',
        'events' => ['OrderShipped'],
    ])->and($array['effects'][0]['type'])->toBe('reloadPage');
});
