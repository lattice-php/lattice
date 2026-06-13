<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;

it('defaults to the stack layout', function (): void {
    $wire = wire(Repeater::make('items')->schema([TextInput::make('a')]));
    expect($wire['props']['layout'])->toBe('stack');
});

it('opts into the table layout via table()', function (): void {
    $repeater = wire(Repeater::make('items')->table()->schema([TextInput::make('a')]));
    $builder = wire(Builder::make('items')->table());

    expect($repeater['props']['layout'])->toBe('table')
        ->and($builder['props']['layout'])->toBe('table');
});
