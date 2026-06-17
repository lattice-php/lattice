<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Affix;

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
    it('dumps the required text input example', function (): void {
        dumpFixture('text-input.required', [
            TextInput::make('name', 'Team name')->placeholder('My team')->required(),
        ]);

        expect('docs/fixtures/text-input.required.json')->toBeReadableFile();
    });

    it('dumps the email text input example', function (): void {
        dumpFixture('text-input.email', [
            TextInput::make('email', 'Email address')->email()->placeholder('you@example.com'),
        ]);

        expect('docs/fixtures/text-input.email.json')->toBeReadableFile();
    });

    it('dumps the affix examples', function (): void {
        dumpFixture('text-input.affixes', [
            TextInput::make('price', 'Price')->prefix('$')->suffix('USD'),
        ]);

        dumpFixture('text-input.affix-icon', [
            TextInput::make('search', 'Search')->prefix(Icon::Search),
        ]);

        expect('docs/fixtures/text-input.affixes.json')->toBeReadableFile()
            ->and('docs/fixtures/text-input.affix-icon.json')->toBeReadableFile();
    });

    it('dumps the common field option examples', function (): void {
        dumpFixture('field.required', [
            TextInput::make('name', 'Team name')->required(),
        ]);

        dumpFixture('field.default-value', [
            TextInput::make('name', 'Team name')->value('Acme Inc'),
        ]);

        dumpFixture('field.disabled', [
            TextInput::make('name', 'Team name')->value('Acme Inc')->disabled(),
        ]);

        dumpFixture('field.read-only', [
            TextInput::make('slug', 'Slug')->value('acme-inc')->readOnly(),
        ]);

        dumpFixture('field.helper-text', [
            TextInput::make('slug', 'Slug')->helperText('Used in the public URL for your team.'),
        ]);

        expect('docs/fixtures/field.required.json')->toBeReadableFile();
    });

    it('dumps the conditional field examples', function (): void {
        dumpFixture('field.visible-when', [
            Choice::make('type', 'Account type')->options([
                Choice::option('Business', 'business'),
                Choice::option('Individual', 'individual'),
            ]),
            TextInput::make('vat', 'VAT ID')->visibleWhen('type', 'business'),
        ]);

        dumpFixture('field.required-when', [
            Choice::make('country', 'Country')->options([
                Choice::option('Germany', 'DE'),
                Choice::option('Austria', 'AT'),
                Choice::option('United States', 'US'),
            ]),
            TextInput::make('vat', 'VAT ID')->requiredWhen('country', 'DE'),
        ]);

        expect('docs/fixtures/field.required-when.json')->toBeReadableFile();
    });
});
