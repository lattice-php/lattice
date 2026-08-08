<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;

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

    $errors = validationErrors(testFormDefinition(fn (): array => [$field]), ['items' => [
        ['type' => 'product', 'product' => '', 'note' => ''],
        ['type' => 'product', 'product' => 'SKU-1', 'note' => ''],
    ]]);

    expect(array_keys($errors))->toBe(['items.1.note']);
});

dataset('nested row containers', [
    'builder inside repeater rows' => [
        fn (): Repeater => Repeater::make('sections')
            ->schema([
                Builder::make('blocks')->templates([
                    RowTemplate::make('text')->schema([
                        Textarea::make('content', 'Block Content')->required(),
                    ]),
                ]),
            ]),
        ['sections' => [['blocks' => [['type' => 'text', 'content' => '']]]]],
        'sections.0.blocks.0.content',
        'The Block Content field is required.',
    ],
    'repeater inside builder rows' => [
        fn (): Builder => Builder::make('sections')
            ->templates([
                RowTemplate::make('section')->schema([
                    Repeater::make('items')->schema([
                        TextInput::make('name', 'Item Name')->required(),
                    ]),
                ]),
            ]),
        ['sections' => [['type' => 'section', 'items' => [['name' => '']]]]],
        'sections.0.items.0.name',
        'The Item Name field is required.',
    ],
]);

it('validates nested rows recursively with full error paths and child labels', function (Repeater|Builder $field, array $payload, string $errorKey, string $message): void {
    $errors = validationErrors(testFormDefinition(fn (): array => [$field]), $payload);

    expect(array_keys($errors))->toBe([$errorKey])
        ->and($errors[$errorKey][0])->toBe($message);
})->with('nested row containers');
