<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Enums\ButtonType;

it('serializes a plain button without a button type', function (): void {
    $node = wire(Button::make('Save'));

    expect($node['type'])->toBe('button')
        ->and($node['props'])->toMatchArray([
            'label' => 'Save',
            'buttonType' => null,
        ]);
});

it('serializes the button type', function (): void {
    $node = wire(Button::make('Save changes')->buttonType(ButtonType::Submit));

    expect($node['props']['buttonType'])->toBe('submit');
});

it('marks a button as a submit button through the submit helper', function (): void {
    $node = wire(Button::make('Save changes')->submit());

    expect($node['props']['buttonType'])->toBe('submit');
});
