<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Components\Wizard;
use Lattice\Lattice\Forms\Components\WizardStep;
use Lattice\Lattice\Ui\Components\Text;

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

test('wizards serialize their orientation and step schema', function (): void {
    $wizard = wire(Wizard::make([
        WizardStep::make('customer'),
        WizardStep::make('review'),
    ])->vertical());

    expect($wizard['type'])->toBe('wizard')
        ->and($wizard['props'])->toMatchArray(['orientation' => 'vertical'])
        ->and(array_column($wizard['schema'], 'type'))->toBe(['wizard-step', 'wizard-step']);
});

test('wizards reject children that are not wizard steps', function (): void {
    wire(Wizard::make()->schema([Text::make('Loose text')]));
})->throws(LogicException::class, 'Wizard children must be WizardStep components.');
