<?php
declare(strict_types=1);

use Carbon\CarbonImmutable;
use Lattice\Ui\I18n\Values\Translatable;

test('it serializes key, payload paths, and static replacements', function (): void {
    $translatable = Translatable::make('orders.shipped-live')
        ->fromPayload(['id' => 'order.id'])
        ->with(['warehouse' => 'Berlin']);

    expect($translatable->jsonSerialize())->toBe([
        'key' => 'orders.shipped-live',
        'payload' => ['id' => 'order.id'],
        'replacements' => ['warehouse' => 'Berlin'],
    ]);
});

test('payload and replacement calls merge instead of replacing', function (): void {
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

test('rt() returns a Translatable for the given key', function (): void {
    expect(rt('a.b')->jsonSerialize()['key'])->toBe('a.b');
});

test('it rehydrates from its wire shape', function (): void {
    $wire = [
        'key' => 'orders.shipped-live',
        'payload' => ['id' => 'order.id'],
        'replacements' => ['warehouse' => 'Berlin'],
    ];

    expect(Translatable::fromWire($wire)->jsonSerialize())->toBe($wire);
});

test('a DateTimeInterface replacement serializes to an ISO 8601 string, scalars unchanged', function (): void {
    $date = CarbonImmutable::parse('2026-03-06T00:00:00+00:00');

    $translatable = Translatable::make('billing.subscription-ends')
        ->with(['date' => $date, 'plan' => 'Pro', 'seats' => 5]);

    expect($translatable->jsonSerialize())->toEqual([
        'key' => 'billing.subscription-ends',
        'payload' => (object) [],
        'replacements' => [
            'date' => '2026-03-06T00:00:00+00:00',
            'plan' => 'Pro',
            'seats' => 5,
        ],
    ]);
});

test('a serialized date round-trips through fromWire as a plain string', function (): void {
    $wire = Translatable::make('billing.subscription-ends')
        ->with(['date' => CarbonImmutable::parse('2026-03-06T00:00:00+00:00')])
        ->jsonSerialize();

    expect(Translatable::fromWire($wire)->jsonSerialize())->toEqual($wire);
});

test('with() still merges a non-scalar, non-DateTimeInterface value without throwing', function (): void {
    /** @var array<string, mixed> $replacement */
    $replacement = ['x' => null];

    $translatable = Translatable::make('k')->with($replacement);

    expect($translatable->jsonSerialize()['replacements'])->toBe(['x' => null]);
});
