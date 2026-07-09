<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowsField;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FieldValidator;

it('mints a uuid rowId for every validated row', function (): void {
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [['title' => 'One'], ['title' => 'Two']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'])->toHaveCount(2)
        ->and($validated['items'][0]['title'])->toBe('One')
        ->and(Str::isUuid($validated['items'][0][RowsField::ROW_ID]))->toBeTrue()
        ->and(Str::isUuid($validated['items'][1][RowsField::ROW_ID]))->toBeTrue()
        ->and($validated['items'][0][RowsField::ROW_ID])->not->toBe($validated['items'][1][RowsField::ROW_ID]);
});

it('preserves a submitted rowId through validation and casting', function (): void {
    $rowId = Str::uuid()->toString();
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [[RowsField::ROW_ID => $rowId, 'title' => 'Kept']]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect($validated['items'][0][RowsField::ROW_ID])->toBe($rowId);
});

it('rejects a rowId that is not a uuid', function (): void {
    $field = Repeater::make('items')->schema([TextInput::make('title')]);
    $request = Request::create('/', 'POST', ['items' => [[RowsField::ROW_ID => 'r0', 'title' => 'x']]]);

    (new FieldValidator)->validate([$field], $request);
})->throws(ValidationException::class);

it('keeps type and rowId together on typed rows', function (): void {
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
        RowsField::ROW_ID => $rowId,
        'title' => 'Hello',
    ]);
});

it('stamps rowIds on nested rows recursively', function (): void {
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

    expect(Str::isUuid($validated['sections'][0][RowsField::ROW_ID]))->toBeTrue()
        ->and($lines)->toHaveCount(2)
        ->and(Str::isUuid($lines[0][RowsField::ROW_ID]))->toBeTrue()
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
