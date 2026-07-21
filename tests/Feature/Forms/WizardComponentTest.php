<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Components\WizardStep;

test('wizard steps serialize their identity and default the label from the name', function (): void {
    $step = wire(WizardStep::make('customer-details')->description('Who is this for?'));

    expect($step['type'])->toBe('wizard-step')
        ->and($step['props'])->toMatchArray([
            'name' => 'customer-details',
            'label' => 'Customer Details',
            'description' => 'Who is this for?',
        ])
        ->and($step['schema'] ?? [])->toBe([]);
});

test('wizard steps serialize an explicit label and their child schema', function (): void {
    $step = wire(WizardStep::make('customer', 'Customer info')->schema([
        TextInput::make('name', 'Name'),
    ]));

    expect($step['props'])->toMatchArray(['name' => 'customer', 'label' => 'Customer info'])
        ->and($step['schema'][0]['type'])->toBe('field.text-input');
});
