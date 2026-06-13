<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\TextInput;

it('serializes a text input', function (): void {
    $node = wire(TextInput::make('name', 'Team name')->placeholder('My team')->required());

    expect($node['type'])->toBe('form.text-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'name',
            'label' => 'Team name',
            'placeholder' => 'My team',
            'required' => true,
        ]);
});

it('serializes an email text input', function (): void {
    $node = wire(TextInput::make('email', 'Email address')->email()->placeholder('you@example.com'));

    expect($node['type'])->toBe('form.text-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'email',
            'label' => 'Email address',
            'type' => 'email',
            'placeholder' => 'you@example.com',
        ]);
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
