<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Choice;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;

function stubDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        TextInput::make('name', 'Name')->rules(['required', 'string']),
        TextInput::make('price', 'Price')->rules(['required', 'numeric']),
    ]);
}

function emailDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        TextInput::make('email', 'Email')->email()->rules(['required']),
    ]);
}

function conditionalDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        Choice::make('type', 'Type')->options([
            Choice::option('Personal', 'personal'),
            Choice::option('Business', 'business'),
        ]),
        TextInput::make('company', 'Company')
            ->dependsOn('type', 'business')
            ->requiredWhen('type', 'business')
            ->rules(['string']),
    ]);
}

it('derives validation rules from fields and fails an empty payload', function (): void {
    $definition = stubDefinition();

    expect(fn (): FormData => $definition->validate(Request::create('/', 'POST', [])))
        ->toThrow(ValidationException::class);
});

it('passes validation with a valid payload', function (): void {
    $definition = stubDefinition();

    $validated = $definition->validate(Request::create('/', 'POST', [
        'name' => 'Desk Lamp',
        'price' => '49.99',
    ]));

    expect($validated)->toMatchArray(['name' => 'Desk Lamp', 'price' => '49.99']);
});

it('rejects a non-fully-qualified email when email() is used', function (): void {
    expect(fn (): FormData => emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'a@a'])))
        ->toThrow(ValidationException::class);
});

it('accepts a proper email when email() is used', function (): void {
    $validated = emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'ada@example.com']));

    expect($validated)->toMatchArray(['email' => 'ada@example.com']);
});

it('skips hidden field rules', function (): void {
    $validated = conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'personal']));

    expect($validated)->not->toHaveKey('company');
});

it('requires the field when its condition matches', function (): void {
    expect(fn (): FormData => conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'business'])))
        ->toThrow(ValidationException::class);
});

function choiceDefinition(bool $required = false): FormDefinition
{
    return testFormDefinition(function () use ($required): array {
        $role = Choice::make('role', 'Role')->options([
            Choice::option('Member', 'member'),
            Choice::option('Admin', 'admin'),
        ]);

        return [$required ? $role->required() : $role];
    });
}

it('rejects a choice value outside its options', function (): void {
    expect(fn (): FormData => choiceDefinition()->validate(Request::create('/', 'POST', ['role' => 'owner'])))
        ->toThrow(ValidationException::class);
});

it('accepts a choice value within its options', function (): void {
    $validated = choiceDefinition()->validate(Request::create('/', 'POST', ['role' => 'admin']));

    expect($validated)->toMatchArray(['role' => 'admin']);
});

it('allows an optional choice to be omitted', function (): void {
    expect(fn (): FormData => choiceDefinition()->validate(Request::create('/', 'POST', [])))
        ->not->toThrow(ValidationException::class);
});

it('still requires a choice marked required', function (): void {
    expect(fn (): FormData => choiceDefinition(required: true)->validate(Request::create('/', 'POST', [])))
        ->toThrow(ValidationException::class);
});
