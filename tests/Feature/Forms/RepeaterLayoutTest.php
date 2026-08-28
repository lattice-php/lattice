<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;
use Lattice\Ui\Components\Grid;

it('validates and casts fields nested inside a row layout container', function (): void {
    $field = Repeater::make('items')->schema([
        Grid::make('row-grid')->columns(3)->schema([
            TextInput::make('name')->required(),
            TextInput::make('qty')->rules(['numeric']),
        ]),
        TextInput::make('note'),
    ]);
    $request = Request::create('/', 'POST', ['items' => [
        ['name' => 'Widget', 'qty' => '2', 'note' => 'n'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['name'])->toBe('Widget')
        ->and($validated['items'][0]['qty'])->toBe('2')
        ->and($validated['items'][0]['note'])->toBe('n');
});

it('rejects missing required fields nested inside a row layout container', function (): void {
    $field = Repeater::make('items')->schema([
        Grid::make('row-grid')->columns(2)->schema([
            TextInput::make('name')->required(),
        ]),
    ]);
    $request = Request::create('/', 'POST', ['items' => [['name' => '']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(ValidationException::class);

it('validates and casts affix selects of row fields', function (): void {
    $field = Repeater::make('items')->schema([
        TextInput::make('amount')->suffixField(
            Select::make('currency')
                ->options([Select::option('EUR', 'eur'), Select::option('USD', 'usd')])
                ->rules(['required', 'in:eur,usd']),
        ),
    ]);

    expect(fn (): array => (new FieldValidator)->validate([$field], Request::create('/', 'POST', [
        'items' => [['amount' => '10', 'currency' => 'gbp']],
    ])))->toThrow(ValidationException::class);

    $validated = (new FieldValidator)->validate([$field], Request::create('/', 'POST', [
        'items' => [['amount' => '10', 'currency' => 'eur']],
    ]));

    expect($validated['items'][0]['amount'])->toBe('10')
        ->and($validated['items'][0]['currency'])->toBe('eur');
});
