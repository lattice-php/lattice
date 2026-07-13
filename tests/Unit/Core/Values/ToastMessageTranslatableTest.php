<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Ui\Enums\Variant;
use Lattice\Lattice\Ui\Values\ToastMessage;

test('a toast message accepts a Translatable and serializes it', function (): void {
    $toast = ToastMessage::make(Variant::Success, rt('orders.shipped-live')->with(['a' => 'b']));

    expect($toast->jsonSerialize()['message'])->toEqual([
        'key' => 'orders.shipped-live',
        'payload' => new stdClass,
        'replacements' => ['a' => 'b'],
    ]);
});

test('Effects::toast accepts a Translatable message', function (): void {
    $effect = Effects::toast(rt('orders.shipped-live'));

    expect($effect->jsonSerialize())
        ->toHaveKey('type', 'toast')
        ->and($effect->jsonSerialize()['props']['toast']->jsonSerialize()['message'])
        ->toEqual(['key' => 'orders.shipped-live', 'payload' => new stdClass, 'replacements' => new stdClass]);
});

test('Effects::toast accepts a Translatable message with an explicit variant', function (): void {
    $effect = Effects::toast(rt('orders.shipped-live'), Variant::Warning);

    $toast = $effect->jsonSerialize()['props']['toast'];

    expect($toast->variant)->toBe(Variant::Warning)
        ->and($toast->jsonSerialize()['message'])->toEqual([
            'key' => 'orders.shipped-live',
            'payload' => new stdClass,
            'replacements' => new stdClass,
        ]);
});

test('Effects::toast still accepts a plain string', function (): void {
    $effect = Effects::toast('Order shipped');

    expect($effect->jsonSerialize()['props']['toast']->jsonSerialize()['message'])->toBe('Order shipped');
});
