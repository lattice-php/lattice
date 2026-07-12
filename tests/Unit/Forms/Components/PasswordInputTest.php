<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Support\Wire;

describe('docs fixtures', function (): void {
    it('matches the password input examples fixture', function (): void {
        assertFixtureMatches('password-input.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            PasswordInput::make('password', 'Password')->placeholder('Your password'),
        ]))));

        assertFixtureMatches('password-input.confirmation', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            PasswordInput::make('password', 'Password')
                ->needsConfirmation()
                ->rules(['required', 'min:8', 'confirmed']),
        ]))));
    });
});

it('serializes a label action to the wire shape', function (): void {
    $props = wire(PasswordInput::make('password', 'Password')
        ->labelAction('Forgot password?', '/forgot', 3))['props'];

    expect($props['labelAction'])->toBe([
        'href' => '/forgot',
        'label' => 'Forgot password?',
        'tabIndex' => 3,
    ]);
});

it('serializes a label action tabIndex as null when omitted', function (): void {
    $props = wire(PasswordInput::make('password', 'Password')
        ->labelAction('Forgot password?', '/forgot'))['props'];

    expect($props['labelAction'])->toBe([
        'href' => '/forgot',
        'label' => 'Forgot password?',
        'tabIndex' => null,
    ]);
});
