<?php
declare(strict_types=1);

use Lattice\Form\Components\Form;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Enums\HttpMethod;

it('serializes the form container wire shape', function (): void {
    $form = Form::make('demo')
        ->action('/demo')
        ->method(HttpMethod::Post)
        ->submitLabel('Save')
        ->status('Saved')
        ->precognitive()
        ->resetOnSuccess(['email'])
        ->resetOnError()
        ->withoutSubmitButton()
        ->fill(['email' => 'a@b.c'])
        ->schema([TextInput::make('email')]);

    $payload = wire($form);

    expect($payload['type'])->toBe('form');
    expect($payload['id'])->toBe('demo');
    expect($payload['props'])->toMatchArray([
        'action' => '/demo',
        'method' => 'post',
        'submitLabel' => 'Save',
        'status' => 'Saved',
        'precognitive' => true,
        'validationTimeout' => Form::DEFAULT_VALIDATION_DEBOUNCE_MS,
        'submitButton' => false,
        'resetOnSuccess' => ['email'],
        'resetOnError' => true,
        'state' => ['email' => 'a@b.c'],
        'fullWidth' => false,
    ]);
    expect($payload)->toHaveKey('schema');
    expect($payload['props'])->not->toHaveKey('context');
});

it('serializes the fullWidth flag on form components', function (): void {
    expect(wire(Form::make('demo'))['props']['fullWidth'])->toBeFalse();
    expect(wire(Form::make('demo')->fullWidth())['props']['fullWidth'])->toBeTrue();
    expect(wire(Form::make('demo')->fullWidth(false))['props']['fullWidth'])->toBeFalse();
});
