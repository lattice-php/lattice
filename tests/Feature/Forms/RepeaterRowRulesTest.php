<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Form\Components\DateInput;
use Lattice\Form\Components\Repeater;
use Lattice\Form\FormDefinition;

function validityPeriodDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        Repeater::make('items')->schema([
            DateInput::make('valid_from'),
            DateInput::make('valid_to')->rules(['after_or_equal:valid_from']),
        ]),
    ]);
}

it('resolves a row rule sibling reference to the concrete row path for the offending row only', function (): void {
    $errors = validationErrors(validityPeriodDefinition(), ['items' => [
        ['valid_from' => '2024-01-01', 'valid_to' => '2024-01-10'],
        ['valid_from' => '2024-01-10', 'valid_to' => '2024-01-01'],
    ]]);

    expect(array_keys($errors))->toBe(['items.1.valid_to']);
});

it('passes when every row satisfies its own sibling-relative rule', function (): void {
    $validated = validityPeriodDefinition()->validate(Request::create('/', 'POST', ['items' => [
        ['valid_from' => '2024-01-01', 'valid_to' => '2024-01-10'],
        ['valid_from' => '2024-02-01', 'valid_to' => '2024-02-01'],
    ]]));

    expect($validated['items'][0]['valid_to'])->toBe('2024-01-10')
        ->and($validated['items'][1]['valid_to'])->toBe('2024-02-01');
});
