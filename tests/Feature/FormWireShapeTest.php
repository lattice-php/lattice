<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;

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

    $payload = json_decode(json_encode($form), true);

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
    ]);
    expect($payload)->toHaveKey('schema');
    expect($payload['props'])->not->toHaveKey('context');
});
