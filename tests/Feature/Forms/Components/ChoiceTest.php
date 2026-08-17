<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Choice;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Text;

it('serializes the option schema only when set', function (): void {
    $plain = Choice::make('plan', 'Plan')->options([Choice::option('Free', 'free')]);

    expect(wire($plain)['props']['optionSchema'])->toBeNull();

    $rich = Choice::make('provider', 'Method')->optionSchema([
        Text::make('')->dataKey('text', 'label'),
        Badge::make('')->dataKey('label', 'role'),
    ]);

    $schema = wire($rich)['props']['optionSchema'];

    expect($schema)->toHaveCount(2)
        ->and($schema[0]['type'])->toBe('text')
        ->and($schema[0]['props']['dataBindings'])->toBe(['text' => 'label'])
        ->and($schema[1]['type'])->toBe('badge')
        ->and($schema[1]['props']['dataBindings'])->toBe(['label' => 'role']);
});

it('omits the option schema when every component is hidden', function (): void {
    $field = Choice::make('provider', 'Method')->optionSchema([
        Text::make('')->dataKey('text', 'label')->hidden(),
    ]);

    expect(wire($field)['props']['optionSchema'])->toBeNull();
});

it('keeps per-option data available to the schema', function (): void {
    $field = Choice::make('provider', 'Method')->options([
        Choice::option('Passkey', 'passkey', ['description' => 'Face ID or Touch ID']),
    ]);

    expect(wire($field)['props']['options'][0]['data'])
        ->toBe(['description' => 'Face ID or Touch ID']);
});

describe('docs fixtures', function (): void {
    it('matches the choice example fixture', function (): void {
        assertFixtureMatches('choice.basic', Wire::toWire([
            Choice::make('plan', 'Plan')->options([
                Choice::option('Free', 'free'),
                Choice::option('Pro', 'pro'),
                Choice::option('Enterprise', 'enterprise'),
            ]),
        ]));
    });
});
