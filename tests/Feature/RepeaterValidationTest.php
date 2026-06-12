<?php

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FieldValidator;

function repeaterField(): Repeater
{
    return Repeater::make('items')
        ->schema([TextInput::make('name')->required()])
        ->minItems(1)
        ->maxItems(2);
}

it('passes a valid row set and returns the array', function (): void {
    $request = Request::create('/', 'POST', ['items' => [['name' => 'A']]]);

    $validated = (new FieldValidator)->validate([repeaterField()], $request);

    expect($validated['items'])->toBe([['name' => 'A']]);
});

it('rejects a row missing a required child', function (): void {
    $request = Request::create('/', 'POST', ['items' => [['name' => '']]]);

    (new FieldValidator)->validate([repeaterField()], $request);
})->throws(ValidationException::class);

it('rejects fewer rows than minItems', function (): void {
    $request = Request::create('/', 'POST', ['items' => []]);

    (new FieldValidator)->validate([repeaterField()], $request);
})->throws(ValidationException::class);

it('rejects more rows than maxItems', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['name' => 'A'], ['name' => 'B'], ['name' => 'C'],
    ]]);

    (new FieldValidator)->validate([repeaterField()], $request);
})->throws(ValidationException::class);

it('casts each row through child field casts', function (): void {
    $request = Request::create('/', 'POST', ['items' => [['name' => 'A'], ['name' => 'B']]]);

    $validated = (new FieldValidator)->validate([repeaterField()], $request);

    expect($validated['items'])->toBe([['name' => 'A'], ['name' => 'B']]);
});
