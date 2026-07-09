<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FieldValidator;

it('retains a builder row field that declares no validation rules', function (): void {
    $field = Builder::make('items')
        ->templates([
            RowTemplate::make('text')->schema([
                TextInput::make('title'),
            ]),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['type' => 'text', 'title' => 'Hello world'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect(withoutRowIds($validated['items']))->toBe([
        ['type' => 'text', 'title' => 'Hello world'],
    ]);
});

it('retains a repeater row field that declares no validation rules alongside a ruled sibling', function (): void {
    $field = Repeater::make('items')
        ->schema([
            TextInput::make('name')->required(),
            TextInput::make('title'),
        ]);

    $request = Request::create('/', 'POST', ['items' => [
        ['name' => 'Row', 'title' => 'Hello world'],
    ]]);

    $validated = (new FieldValidator)->validate([$field], $request);

    expect(withoutRowIds($validated['items']))->toBe([
        ['name' => 'Row', 'title' => 'Hello world'],
    ]);
});
