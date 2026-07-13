<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Ui\Enums\Variant;

test('a toast accepts a Translatable and serializes it', function (): void {
    $toast = Toast::make(Variant::Success, rt('orders.shipped-live')->with(['a' => 'b']));

    expect(wire($toast)['props']['message'])->toBe([
        'key' => 'orders.shipped-live',
        'payload' => [],
        'replacements' => ['a' => 'b'],
    ]);
});

test('Effects::toast accepts a Translatable message', function (): void {
    $wire = wire(Effects::toast(rt('orders.shipped-live')));

    expect($wire['type'])->toBe('toast')
        ->and($wire['props']['message'])->toBe([
            'key' => 'orders.shipped-live',
            'payload' => [],
            'replacements' => [],
        ]);
});

test('Effects::toast accepts a Translatable message with an explicit variant', function (): void {
    $effect = Effects::toast(rt('orders.shipped-live'), Variant::Warning);

    expect($effect->variant)->toBe(Variant::Warning)
        ->and(wire($effect)['props']['message']['key'])->toBe('orders.shipped-live');
});

test('Effects::toast still accepts a plain string', function (): void {
    expect(wire(Effects::toast('Order shipped'))['props']['message'])->toBe('Order shipped');
});
