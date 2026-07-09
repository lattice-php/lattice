<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FieldValidator;

function builderField(): Builder
{
    return Builder::make('items')
        ->templates([
            RowTemplate::make('text')->schema([Textarea::make('content')->required()]),
            RowTemplate::make('product')->schema([
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

    expect(withoutRowIds($validated['items']))->toBe([
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
        ->templates([
            RowTemplate::make('product')->schema([
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
        ->templates([
            RowTemplate::make('product')->schema([
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
        ->templates([
            RowTemplate::make('product')->schema([
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

it('validates builder children recursively inside repeater rows', function (): void {
    $field = Repeater::make('sections')
        ->schema([
            TextInput::make('title')->required(),
            Builder::make('blocks')->templates([
                RowTemplate::make('text')->schema([
                    Textarea::make('content')->required(),
                ]),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['sections' => [[
        'title' => 'Intro',
        'blocks' => [
            ['type' => 'text', 'content' => ''],
        ],
    ]]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect(array_keys($errors ?? []))->toBe(['sections.0.blocks.0.content']);
});

it('uses nested builder child labels in validation messages', function (): void {
    $field = Repeater::make('sections')
        ->schema([
            Builder::make('blocks')->templates([
                RowTemplate::make('text')->schema([
                    Textarea::make('content', 'Block Content')->required(),
                ]),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['sections' => [[
        'blocks' => [
            ['type' => 'text', 'content' => ''],
        ],
    ]]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect($errors['sections.0.blocks.0.content'][0] ?? null)->toBe('The Block Content field is required.');
});

it('validates repeater children recursively inside builder rows', function (): void {
    $field = Builder::make('sections')
        ->templates([
            RowTemplate::make('section')->schema([
                Repeater::make('items')->schema([
                    TextInput::make('name')->required(),
                ]),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['sections' => [[
        'type' => 'section',
        'items' => [
            ['name' => ''],
        ],
    ]]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect(array_keys($errors ?? []))->toBe(['sections.0.items.0.name']);
});

it('uses nested repeater child labels inside builder rows in validation messages', function (): void {
    $field = Builder::make('sections')
        ->templates([
            RowTemplate::make('section')->schema([
                Repeater::make('items')->schema([
                    TextInput::make('name', 'Item Name')->required(),
                ]),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['sections' => [[
        'type' => 'section',
        'items' => [
            ['name' => ''],
        ],
    ]]]);

    $errors = null;

    try {
        (new FieldValidator)->validate([$field], $request);
    } catch (ValidationException $exception) {
        $errors = $exception->errors();
    }

    expect($errors['sections.0.items.0.name'][0] ?? null)->toBe('The Item Name field is required.');
});
