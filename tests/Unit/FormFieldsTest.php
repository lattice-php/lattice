<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;

it('flattens fields including nested containers', function (): void {
    $form = Form::make('demo')->schema([
        TextInput::make('name', 'Name'),
        Stack::make('group')->children([
            TextInput::make('sku', 'SKU'),
            Choice::make('status', 'Status'),
        ]),
    ]);

    expect($form->fields()->map->name()->all())->toBe(['name', 'sku', 'status']);
});
