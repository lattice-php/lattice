<?php
declare(strict_types=1);

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

it('requires row children from same-row sibling conditions', function (): void {
    $field = Repeater::make('items')
        ->schema([
            TextInput::make('product'),
            TextInput::make('note')->requiredWhen('product', '!=', ''),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['product' => '', 'note' => ''],
        ['product' => 'SKU-1', 'note' => ''],
    ]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect(array_keys($errors ?? []))->toBe(['items.1.note']);
});

it('lets row values shadow same-named form values for conditions', function (): void {
    $field = Repeater::make('items')
        ->schema([
            TextInput::make('product'),
            TextInput::make('note')->requiredWhen('product', '!=', ''),
        ]);

    $request = Request::create('/', 'POST', [
        'product' => 'GLOBAL-SKU',
        'items' => [
            ['product' => '', 'note' => ''],
        ],
    ]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['product'])->toBe('');
});

it('skips validation for row children hidden by same-row conditions', function (): void {
    $field = Repeater::make('items')
        ->schema([
            TextInput::make('kind'),
            TextInput::make('note')
                ->visibleWhen('kind', 'paid')
                ->rules(['required']),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['kind' => 'free'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['kind'])->toBe('free');
});
