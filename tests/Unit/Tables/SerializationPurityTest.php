<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Tables\Columns\TextColumn;

it('serializes a column without mutating it and yields identical output twice', function (): void {
    $column = TextColumn::make('name')->sortable();

    $first = wire($column);
    $second = wire($column);

    expect($second)->toEqual($first)
        ->and($column->sortable)->toBeFalse()
        ->and($column->filter)->toBeNull();
});

it('serializes a field without mutating its computed props', function (): void {
    $field = TextInput::make('email')->visibleWhen('type', 'business');

    $first = wire($field);
    $second = wire($field);

    expect($second)->toEqual($first)
        ->and($field->conditions)->toBeNull()
        ->and($field->dependsOnKeys)->toBeNull()
        ->and($field->dependsOnAny)->toBeFalse();
});
