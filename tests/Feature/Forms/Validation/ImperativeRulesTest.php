<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;

function imperativeRulesDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        TextInput::make('type', 'Type'),
        TextInput::make('vat_id', 'VAT ID')
            ->rules(fn (FormData $data): array => $data->get('type') === 'business'
                ? ['required', 'string']
                : ['nullable']),
    ]);
}

it('skips the rule when the closure returns it optional', function (): void {
    $validated = imperativeRulesDefinition()->validate(Request::create('/', 'POST', ['type' => 'personal']));

    expect($validated)->not->toHaveKey('vat_id');
});

it('enforces the rule when the closure makes it required', function (): void {
    expect(fn (): FormData => imperativeRulesDefinition()->validate(Request::create('/', 'POST', ['type' => 'business'])))
        ->toThrow(ValidationException::class);
});

it('passes when the conditionally required value is provided', function (): void {
    $validated = imperativeRulesDefinition()->validate(Request::create('/', 'POST', [
        'type' => 'business',
        'vat_id' => 'DE123',
    ]));

    expect($validated)->toMatchArray(['vat_id' => 'DE123']);
});
