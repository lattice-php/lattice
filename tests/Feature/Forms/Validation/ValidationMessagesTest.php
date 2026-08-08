<?php
declare(strict_types=1);

use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;

function messagesDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        TextInput::make('company', 'Company')->rules(['required']),
        TextInput::make('vat_id', 'VAT ID')
            ->rules(['required'])
            ->message('required', 'We need your VAT ID.'),
    ]);
}

it('uses the field label as the validation attribute name', function (): void {
    expect(validationErrors(messagesDefinition())['company'][0])->toBe('The Company field is required.');
});

it('uses a per-field custom validation message', function (): void {
    expect(validationErrors(messagesDefinition())['vat_id'][0])->toBe('We need your VAT ID.');
});
