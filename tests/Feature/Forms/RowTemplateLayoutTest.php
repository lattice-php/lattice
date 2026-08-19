<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;
use Lattice\Ui\Components\Grid;

it('validates and casts fields nested inside a template layout container', function (): void {
    $field = Builder::make('items')->templates([
        RowTemplate::make('product')->schema([
            Grid::make('row-grid')->columns(3)->schema([
                TextInput::make('name')->required(),
                TextInput::make('qty')->rules(['numeric']),
            ]),
            TextInput::make('note'),
        ]),
    ]);
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'name' => 'Widget', 'qty' => '2', 'note' => 'n'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['name'])->toBe('Widget')
        ->and($validated['items'][0]['qty'])->toBe('2')
        ->and($validated['items'][0]['note'])->toBe('n');
});

it('rejects missing required fields nested inside a template layout container', function (): void {
    $field = Builder::make('items')->templates([
        RowTemplate::make('product')->schema([
            Grid::make('row-grid')->columns(2)->schema([
                TextInput::make('name')->required(),
            ]),
        ]),
    ]);
    $request = Request::create('/', 'POST', ['items' => [['type' => 'product']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(ValidationException::class);
