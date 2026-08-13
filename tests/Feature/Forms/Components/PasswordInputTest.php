<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\PasswordInput;
use Lattice\Ui\Components\Link;

describe('docs fixtures', function (): void {
    it('matches the password input examples fixture', function (): void {
        assertFixtureMatches('password-input.basic', Wire::toWire([
            PasswordInput::make('password', 'Password')->placeholder('Your password'),
        ]));

        assertFixtureMatches('password-input.confirmation', Wire::toWire([
            PasswordInput::make('password', 'Password')
                ->needsConfirmation()
                ->rules(['required', 'min:8', 'confirmed']),
        ]));
    });
});

it('serializes a label action as a wire node', function (): void {
    $props = wire(PasswordInput::make('password', 'Password')
        ->labelAction(Link::make('Forgot password?')->href('/forgot')->tabIndex(3)))['props'];

    expect($props['labelAction']['type'])->toBe('link')
        ->and($props['labelAction']['props'])->toMatchArray([
            'label' => 'Forgot password?',
            'href' => '/forgot',
            'tabIndex' => 3,
        ]);
});
