<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FieldValidator;

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
