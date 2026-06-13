<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FieldValidator;

function builderField(): Builder
{
    return Builder::make('items')
        ->blocks([
            Block::make('text')->schema([Textarea::make('content')->required()]),
            Block::make('product')->schema([
                TextInput::make('product')->required(),
                TextInput::make('qty')->rules(['numeric']),
            ]),
        ])
        ->minItems(1);
}

it('validates each row against its own block', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'text', 'content' => 'Intro'],
        ['type' => 'product', 'product' => 'SKU-1', 'qty' => '2'],
    ]]);

    $validated = (new FieldValidator)->validate([builderField()], $request);

    expect($validated['items'])->toBe([
        ['type' => 'text', 'content' => 'Intro'],
        ['type' => 'product', 'product' => 'SKU-1', 'qty' => '2'],
    ]);
});

it('rejects a product row missing its required product', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'product' => '', 'qty' => '1'],
    ]]);

    (new FieldValidator)->validate([builderField()], $request);
})->throws(ValidationException::class);

it('rejects an unknown block type', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'video', 'src' => 'x'],
    ]]);

    (new FieldValidator)->validate([builderField()], $request);
})->throws(ValidationException::class);

it('does not require a text row to satisfy product rules', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'text', 'content' => 'Just text'],
    ]]);

    $validated = (new FieldValidator)->validate([builderField()], $request);

    expect($validated['items'][0]['type'])->toBe('text');
});

it('requires block children from same-row sibling conditions', function (): void {
    $field = Builder::make('items')
        ->blocks([
            Block::make('product')->schema([
                TextInput::make('product'),
                TextInput::make('note')->requiredWhen('product', '!=', ''),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'product' => '', 'note' => ''],
        ['type' => 'product', 'product' => 'SKU-1', 'note' => ''],
    ]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect(array_keys($errors ?? []))->toBe(['items.1.note']);
});

it('lets block row values shadow same-named form values for conditions', function (): void {
    $field = Builder::make('items')
        ->blocks([
            Block::make('product')->schema([
                TextInput::make('product'),
                TextInput::make('note')->requiredWhen('product', '!=', ''),
            ]),
        ]);

    $request = Request::create('/', 'POST', [
        'product' => 'GLOBAL-SKU',
        'items' => [
            ['type' => 'product', 'product' => '', 'note' => ''],
        ],
    ]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['type'])->toBe('product');
});

it('skips validation for block children hidden by same-row conditions', function (): void {
    $field = Builder::make('items')
        ->blocks([
            Block::make('product')->schema([
                TextInput::make('kind'),
                TextInput::make('note')
                    ->visibleWhen('kind', 'paid')
                    ->rules(['required']),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'kind' => 'free'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['type'])->toBe('product');
});
