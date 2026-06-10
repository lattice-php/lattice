<?php

declare(strict_types=1);

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
});
