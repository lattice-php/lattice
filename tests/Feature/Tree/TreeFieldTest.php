<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\RowsField;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;
use Lattice\Form\FormData;
use Lattice\Tree\Forms\Components\TreeField;

function lineItemsTreeField(): TreeField
{
    return TreeField::make('items')
        ->maxDepth(2)
        ->acceptsChildrenFor(['product'])
        ->templates([
            RowTemplate::make('product')->schema([
                TextInput::make('name')->required(),
                TextInput::make('qty')->rules(['numeric']),
            ]),
            RowTemplate::make('text')->schema([
                TextInput::make('content')->required(),
            ]),
        ]);
}

it('validates and casts nested rows through the shared templates', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        [
            'type' => 'product',
            'name' => 'Bundle',
            'qty' => '1',
            'children' => [
                ['type' => 'text', 'content' => 'Included cabling'],
                ['type' => 'product', 'name' => 'Switch', 'qty' => '2'],
            ],
        ],
    ]]);

    $validated = (new FieldValidator)->validate([lineItemsTreeField()], $request);
    $root = $validated['items'][0];

    expect($root['type'])->toBe('product')
        ->and($root['name'])->toBe('Bundle')
        ->and(Str::isUuid($root[RowsField::ROW_ID]))->toBeTrue()
        ->and($root['children'])->toHaveCount(2)
        ->and($root['children'][0]['type'])->toBe('text')
        ->and($root['children'][0]['content'])->toBe('Included cabling')
        ->and(Str::isUuid($root['children'][0][RowsField::ROW_ID]))->toBeTrue()
        ->and($root['children'][1]['name'])->toBe('Switch');
});

it('surfaces validation errors at the nested dot path', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'name' => 'Root', 'children' => [
            ['type' => 'product', 'qty' => 'not-a-number'],
        ]],
    ]]);

    try {
        (new FieldValidator)->validate([lineItemsTreeField()], $request);
        $this->fail('Expected a validation exception.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKeys(['items.0.children.0.name', 'items.0.children.0.qty']);
    }
});

it('prohibits children below the configured max depth', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'name' => 'Root', 'children' => [
            ['type' => 'product', 'name' => 'Child', 'children' => [
                ['type' => 'text', 'content' => 'Too deep'],
            ]],
        ]],
    ]]);

    try {
        (new FieldValidator)->validate([lineItemsTreeField()], $request);
        $this->fail('Expected a validation exception.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('items.0.children.0.children');
    }
});

it('prohibits children on a type that does not accept them', function (): void {
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'text', 'content' => 'Plain', 'children' => [
            ['type' => 'text', 'content' => 'Nested'],
        ]],
    ]]);

    try {
        (new FieldValidator)->validate([lineItemsTreeField()], $request);
        $this->fail('Expected a validation exception.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('items.0.children');
    }
});

it('validates unlimited depth when no max depth is configured', function (): void {
    $field = TreeField::make('items')->templates([
        RowTemplate::make('node')->schema([TextInput::make('name')->required()]),
    ]);
    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'node', 'name' => 'a', 'children' => [
            ['type' => 'node', 'name' => 'b', 'children' => [
                ['type' => 'node', 'name' => 'c'],
            ]],
        ]],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0]['children'][0]['children'][0]['name'])->toBe('c');
});

it('preserves submitted row ids at every level', function (): void {
    $rootId = Str::uuid()->toString();
    $childId = Str::uuid()->toString();
    $request = Request::create('/', 'POST', ['items' => [
        ['rowId' => $rootId, 'type' => 'product', 'name' => 'Root', 'children' => [
            ['rowId' => $childId, 'type' => 'text', 'content' => 'Child'],
        ]],
    ]]);

    $validated = (new FieldValidator)->validate([lineItemsTreeField()], $request);

    expect($validated['items'][0][RowsField::ROW_ID])->toBe($rootId)
        ->and($validated['items'][0]['children'][0][RowsField::ROW_ID])->toBe($childId);
});

it('stamps row ids recursively onto the server-filled wire value', function (): void {
    $field = lineItemsTreeField()->value([
        ['type' => 'product', 'name' => 'Root', 'children' => [
            ['type' => 'text', 'content' => 'Child'],
        ]],
    ]);

    $wire = wire($field);
    $value = $wire['props']['value'];

    expect($wire['type'])->toBe('field.tree')
        ->and($wire['props']['maxDepth'])->toBe(2)
        ->and($wire['props']['childBearingTypes'])->toBe(['product'])
        ->and(Str::isUuid($value[0][RowsField::ROW_ID]))->toBeTrue()
        ->and(Str::isUuid($value[0]['children'][0][RowsField::ROW_ID]))->toBeTrue();
});

it('resolves editable prefill values inside nested child rows', function (): void {
    $definition = testFormDefinition(fn (): array => [
        TreeField::make('items')->acceptsChildrenFor(['product'])->templates([
            RowTemplate::make('product')->schema([
                TextInput::make('qty'),
                TextInput::make('price'),
                TextInput::make('net')->value(
                    fn (FormData $row): float => $row->float('qty') * $row->float('price'),
                    editable: true,
                    resetOn: ['qty', 'price'],
                ),
            ]),
        ]),
    ]);

    $result = $definition->resolveFields(Request::create('/', 'POST', ['items' => [
        ['type' => 'product', 'qty' => '2', 'price' => '10', 'children' => [
            ['type' => 'product', 'qty' => '3', 'price' => '5'],
        ]],
    ]]));

    expect($result->prefill)->toBe([
        'items.0.net' => 20.0,
        'items.0.children.0.net' => 15.0,
    ]);
});

it('rejects a template that declares the reserved children field', function (): void {
    TreeField::make('items')->templates([
        RowTemplate::make('node')->schema([TextInput::make('children')]),
    ]);
})->throws(LogicException::class);

it('rejects a max depth below one', function (): void {
    TreeField::make('items')->maxDepth(0);
})->throws(InvalidArgumentException::class);
