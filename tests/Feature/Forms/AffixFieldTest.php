<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\NumberInput;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;

function currencySelect(): Select
{
    return Select::make('currency', 'Currency')
        ->options([
            Select::option('EUR', 'eur'),
            Select::option('USD', 'usd'),
        ])
        ->rules(['required', 'in:eur,usd']);
}

it('serializes an affix select as a child schema node with a side marker', function (): void {
    $wire = wire(NumberInput::make('amount', 'Amount')->suffixField(currencySelect()));

    expect($wire['props']['suffixFieldName'])->toBe('currency')
        ->and($wire['props'])->not->toHaveKey('suffixFieldSelect')
        ->and($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('field.select')
        ->and($wire['schema'][0]['props']['name'])->toBe('currency');
});

it('serializes a prefix affix select with its own side marker', function (): void {
    $wire = wire(TextInput::make('phone', 'Phone')->prefixField(
        Select::make('dialing_code')->options([Select::option('+49', '49')]),
    ));

    expect($wire['props']['prefixFieldName'])->toBe('dialing_code')
        ->and($wire['schema'][0]['props']['name'])->toBe('dialing_code');
});

it('includes affix selects in the form field collection', function (): void {
    $form = Form::make('demo')->schema([
        NumberInput::make('amount', 'Amount')->suffixField(currencySelect()),
    ]);

    expect($form->fields()->map->name()->all())->toBe(['amount', 'currency']);
});

it('validates affix select rules alongside the host field', function (): void {
    $definition = testFormDefinition(fn (): array => [
        NumberInput::make('amount', 'Amount')
            ->rules(['required', 'numeric'])
            ->suffixField(currencySelect()),
    ]);

    expect(fn (): FormData => $definition->validate(Request::create('/', 'POST', [
        'amount' => '10',
        'currency' => 'gbp',
    ])))->toThrow(ValidationException::class);

    $validated = $definition->validate(Request::create('/', 'POST', [
        'amount' => '10',
        'currency' => 'eur',
    ]));

    expect($validated)->toMatchArray(['amount' => '10', 'currency' => 'eur']);
});

it('rejects a multiple select as an affix field', function (): void {
    $field = NumberInput::make('amount')->suffixField(currencySelect()->multiple());

    expect(fn (): array => $field->affixFields())->toThrow(LogicException::class);
});
