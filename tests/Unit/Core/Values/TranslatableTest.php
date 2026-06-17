<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Values\Translatable;

test('it serializes key, payload paths, and static replacements', function () {
    $translatable = Translatable::make('orders.shipped-live')
        ->fromPayload(['id' => 'order.id'])
        ->with(['warehouse' => 'Berlin']);

    expect($translatable->jsonSerialize())->toBe([
        'key' => 'orders.shipped-live',
        'payload' => ['id' => 'order.id'],
        'replacements' => ['warehouse' => 'Berlin'],
    ]);
});

test('payload and replacement calls merge instead of replacing', function () {
    $translatable = Translatable::make('k')
        ->fromPayload(['a' => 'x.a'])
        ->fromPayload(['b' => 'x.b'])
        ->with(['c' => 1])
        ->with(['d' => 2]);

    expect($translatable->jsonSerialize())->toBe([
        'key' => 'k',
        'payload' => ['a' => 'x.a', 'b' => 'x.b'],
        'replacements' => ['c' => 1, 'd' => 2],
    ]);
});

test('rt() returns a Translatable for the given key', function () {
    expect(rt('a.b')->jsonSerialize()['key'])->toBe('a.b');
});
