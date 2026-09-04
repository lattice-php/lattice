<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\RowsField;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;

it('keeps every row in the validated payload without leaking rowId', function (): void {
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [['title' => 'One'], ['title' => 'Two']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'])->toHaveCount(2)
        ->and($validated['items'][0])->not->toHaveKey(RowsField::ROW_ID)
        ->and($validated['items'][0]['title'])->toBe('One')
        ->and($validated['items'][1])->not->toHaveKey(RowsField::ROW_ID)
        ->and($validated['items'][1]['title'])->toBe('Two');
});

it('accepts a submitted rowId without leaking it into the validated payload', function (): void {
    $rowId = Str::uuid()->toString();
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [[RowsField::ROW_ID => $rowId, 'title' => 'Kept']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0])->not->toHaveKey(RowsField::ROW_ID)
        ->and($validated['items'][0]['title'])->toBe('Kept');
});

it('rejects a rowId that is not a uuid', function (): void {
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [[RowsField::ROW_ID => 'r0', 'title' => 'x']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(ValidationException::class);

it('keeps the type discriminator on typed rows without leaking rowId', function (): void {
    $rowId = Str::uuid()->toString();
    $field = Builder::make('items')->templates([
        RowTemplate::make('text')->schema([TextInput::make('title')]),
    ]);
    $request = Request::create('/', 'POST', ['items' => [
        [RowsField::ROW_ID => $rowId, 'type' => 'text', 'title' => 'Hello'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0])->toEqual([
        'type' => 'text',
        'title' => 'Hello',
    ]);
});

it('drops rowId from nested rows recursively', function (): void {
    $field = Builder::make('sections')->templates([
        RowTemplate::make('list')->schema([
            Repeater::make('lines')->schema([TextInput::make('label')]),
        ]),
    ]);
    $request = Request::create('/', 'POST', ['sections' => [
        ['type' => 'list', 'lines' => [['label' => 'A'], ['label' => 'B']]],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);
    $lines = $validated['sections'][0]['lines'];

    expect($validated['sections'][0])->not->toHaveKey(RowsField::ROW_ID)
        ->and($lines)->toHaveCount(2)
        ->and($lines[0])->not->toHaveKey(RowsField::ROW_ID)
        ->and($lines[0]['label'])->toBe('A');
});

it('throws when a row schema declares the reserved rowId field', function (): void {
    $field = Repeater::make('items')->schema([TextInput::make(RowsField::ROW_ID)]);
    $request = Request::create('/', 'POST', ['items' => [['title' => 'x']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(LogicException::class);

it('stamps uuids onto server-filled rows on the wire', function (): void {
    $field = Repeater::make('items')
        ->schema([TextInput::make('title')])
        ->value([['title' => 'Stored']]);

    $wire = wire($field);

    expect(Str::isUuid($wire['props']['value'][0][RowsField::ROW_ID]))->toBeTrue()
        ->and($wire['props']['value'][0]['title'])->toBe('Stored');
});

it('drops rowId from the payload handed to handle() while keeping it on the wire', function (): void {
    $rowId = Str::uuid()->toString();
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [[RowsField::ROW_ID => $rowId, 'title' => 'Kept']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0])->not->toHaveKey(RowsField::ROW_ID);

    $wire = wire($field->value([['title' => 'Kept', RowsField::ROW_ID => $rowId]]));

    expect($wire['props']['value'][0][RowsField::ROW_ID])->toBe($rowId);
});
