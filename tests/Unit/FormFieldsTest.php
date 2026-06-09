<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Forms\Components\Choice;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\TextInput;

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
