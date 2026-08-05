<?php
declare(strict_types=1);

use Lattice\Form\Components\Choice;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Components\Stack;

it('flattens fields including nested containers', function (): void {
    $form = Form::make('demo')->schema([
        TextInput::make('name', 'Name'),
        Stack::make('group')->schema([
            TextInput::make('sku', 'SKU'),
            Choice::make('status', 'Status'),
        ]),
    ]);

    expect($form->fields()->map->name()->all())->toBe(['name', 'sku', 'status']);
});
