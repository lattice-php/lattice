<?php

use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;

it('defaults to the stack layout', function (): void {
    $wire = json_decode(json_encode(Repeater::make('items')->schema([TextInput::make('a')])), true);
    expect($wire['props']['layout'])->toBe('stack');
});

it('opts into the table layout via table()', function (): void {
    $repeater = json_decode(json_encode(Repeater::make('items')->table()->schema([TextInput::make('a')])), true);
    $builder = json_decode(json_encode(Builder::make('items')->table()), true);

    expect($repeater['props']['layout'])->toBe('table')
        ->and($builder['props']['layout'])->toBe('table');
});
