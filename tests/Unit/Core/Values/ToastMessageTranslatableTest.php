<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Effect;

test('a toast message accepts a Translatable and serializes it', function () {
    $toast = ToastMessage::make(Variant::Success, rt('orders.shipped-live')->with(['a' => 'b']));

    expect($toast->jsonSerialize()['message'])->toBe([
        'key' => 'orders.shipped-live',
        'payload' => [],
        'replacements' => ['a' => 'b'],
    ]);
});

test('Effect::toast accepts a Translatable message', function () {
    $effect = Effect::toast(rt('orders.shipped-live'));

    expect($effect->jsonSerialize())
        ->toHaveKey('type', 'toast')
        ->and($effect->jsonSerialize()['toast']->jsonSerialize()['message'])
        ->toMatchArray(['key' => 'orders.shipped-live']);
});

test('Effect::toast still accepts a plain string', function () {
    $effect = Effect::toast('Order shipped');

    expect($effect->jsonSerialize()['toast']->jsonSerialize()['message'])->toBe('Order shipped');
});
