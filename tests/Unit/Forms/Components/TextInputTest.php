<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Affix;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Enums\Icon;

it('serializes a text input', function (): void {
    $node = wire(TextInput::make('name', 'Team name')->placeholder('My team')->required());

    expect($node['type'])->toBe('field.text-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'name',
            'label' => 'Team name',
            'placeholder' => 'My team',
            'required' => true,
        ]);
});

it('serializes the copyable flag', function (): void {
    expect(wire(TextInput::make('api_key', 'API key')->copyable())['props'])
        ->toHaveKey('copyable', true)
        ->and(wire(TextInput::make('name', 'Name'))['props'])
        ->toHaveKey('copyable', false);
});

it('serializes an email text input', function (): void {
    $node = wire(TextInput::make('email', 'Email address')->email()->placeholder('you@example.com'));

    expect($node['type'])->toBe('field.text-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'email',
            'label' => 'Email address',
            'type' => 'email',
            'placeholder' => 'you@example.com',
        ]);
});

describe('affixes', function (): void {
    it('serializes an icon prefix from an enum', function (): void {
        $node = wire(TextInput::make('amount', 'Amount')->prefix(Icon::Eye));

        expect($node['props']['prefix'])->toBe(['icon' => 'eye', 'text' => null]);
    });

    it('serializes a text suffix', function (): void {
        $node = wire(TextInput::make('weight', 'Weight')->suffix('kg'));

        expect($node['props']['suffix'])->toBe(['icon' => null, 'text' => 'kg']);
    });

    it('accepts an explicit affix value object', function (): void {
        $node = wire(TextInput::make('handle', 'Handle')->prefix(Affix::text('@')));

        expect($node['props']['prefix'])->toBe(['icon' => null, 'text' => '@']);
    });

    it('supports affixes on number inputs', function (): void {
        $node = wire(NumberInput::make('price', 'Price')->prefix('$')->suffix('USD'));

        expect($node['props']['prefix'])->toBe(['icon' => null, 'text' => '$'])
            ->and($node['props']['suffix'])->toBe(['icon' => null, 'text' => 'USD']);
    });

    it('supports affixes on password inputs', function (): void {
        $node = wire(PasswordInput::make('token', 'Token')->prefix(Icon::Eye));

        expect($node['props']['prefix'])->toBe(['icon' => 'eye', 'text' => null]);
    });
});

describe('docs fixtures', function (): void {
    it('matches the required text input example fixture', function (): void {
        assertFixtureMatches('text-input.required', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('name', 'Team name')->placeholder('My team')->required(),
        ]))));
    });

    it('matches the email text input example fixture', function (): void {
        assertFixtureMatches('text-input.email', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('email', 'Email address')->email()->placeholder('you@example.com'),
        ]))));
    });

    it('matches the affix examples fixture', function (): void {
        assertFixtureMatches('text-input.affixes', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('price', 'Price')->prefix('$')->suffix('USD'),
        ]))));

        assertFixtureMatches('text-input.affix-icon', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('search', 'Search')->prefix(Icon::Search),
        ]))));
    });

    it('matches the common field option examples fixture', function (): void {
        assertFixtureMatches('field.required', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('name', 'Team name')->required(),
        ]))));

        assertFixtureMatches('field.default-value', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('name', 'Team name')->value('Acme Inc'),
        ]))));

        assertFixtureMatches('field.disabled', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('name', 'Team name')->value('Acme Inc')->disabled(),
        ]))));

        assertFixtureMatches('field.read-only', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('slug', 'Slug')->value('acme-inc')->readOnly(),
        ]))));

        assertFixtureMatches('field.helper-text', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TextInput::make('slug', 'Slug')->helperText('Used in the public URL for your team.'),
        ]))));
    });

    it('matches the conditional field examples fixture', function (): void {
        assertFixtureMatches('field.visible-when', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Choice::make('type', 'Account type')->options([
                Choice::option('Business', 'business'),
                Choice::option('Individual', 'individual'),
            ]),
            TextInput::make('vat', 'VAT ID')->visibleWhen('type', 'business'),
        ]))));

        assertFixtureMatches('field.required-when', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Choice::make('country', 'Country')->options([
                Choice::option('Germany', 'DE'),
                Choice::option('Austria', 'AT'),
                Choice::option('United States', 'US'),
            ]),
            TextInput::make('vat', 'VAT ID')->requiredWhen('country', 'DE'),
        ]))));
    });
});
