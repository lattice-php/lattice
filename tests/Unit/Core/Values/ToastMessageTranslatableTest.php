<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Effect;

test('a toast message accepts a Translatable and serializes it', function (): void {
    $toast = ToastMessage::make(Variant::Success, rt('orders.shipped-live')->with(['a' => 'b']));

    expect($toast->jsonSerialize()['message'])->toEqual([
        'key' => 'orders.shipped-live',
        'payload' => new stdClass,
        'replacements' => ['a' => 'b'],
    ]);
});

test('Effect::toast accepts a Translatable message', function (): void {
    $effect = Effect::toast(rt('orders.shipped-live'));

    expect($effect->jsonSerialize())
        ->toHaveKey('type', 'toast')
        ->and($effect->jsonSerialize()['toast']->jsonSerialize()['message'])
        ->toEqual(['key' => 'orders.shipped-live', 'payload' => new stdClass, 'replacements' => new stdClass]);
});

test('Effect::toast accepts a Translatable message with an explicit variant', function (): void {
    $effect = Effect::toast(rt('orders.shipped-live'), Variant::Warning);

    $toast = $effect->jsonSerialize()['toast'];

    expect($toast->variant)->toBe(Variant::Warning)
        ->and($toast->jsonSerialize()['message'])->toEqual([
            'key' => 'orders.shipped-live',
            'payload' => new stdClass,
            'replacements' => new stdClass,
        ]);
});

test('Effect::toast still accepts a plain string', function (): void {
    $effect = Effect::toast('Order shipped');

    expect($effect->jsonSerialize()['toast']->jsonSerialize()['message'])->toBe('Order shipped');
});
