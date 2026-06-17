<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

test('forms serialize schema children like pages', function () {
    expect(wire(Form::make('profile-form')->schema([
        Text::make('Profile details'),
    ])))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                        'align' => null,
                        'size' => 'md',
                        'color' => 'muted',
                    ],
                ],
            ],
        ]);
});

test('password inputs can request automatic confirmation fields', function () {
    expect(wire(PasswordInput::make('password', 'Password')
        ->required()
        ->passwordRules('minlength:8')
        ->needsConfirmation()))
        ->toMatchArray([
            'type' => 'field.password-input',
            'props' => [
                'confirmation' => [
                    'label' => 'Confirm password',
                    'name' => 'password_confirmation',
                    'placeholder' => 'Confirm password',
                ],
                'label' => 'Password',
                'helperText' => null,
                'tooltip' => null,
                'name' => 'password',
                'passwordRules' => 'minlength:8',
                'required' => true,
                'labelAction' => null,
                'value' => null,
                'hidden' => false,
                'readOnly' => false,
                'disabled' => false,
                'conditions' => null,
                'dependsOnKeys' => null,
                'dependsOnAny' => false,
                'editablePrefill' => false,
                'prefillResetOn' => null,
                'prefillRefreshOn' => null,
                'autoComplete' => null,
                'autoFocus' => false,
                'placeholder' => null,
                'tabIndex' => null,
                'columnWidth' => 'md',
                'prefix' => null,
                'suffix' => null,
            ],
        ]);
});

test('editable computed fields serialize an explicit client prefill flag', function () {
    $wire = wire(
        TextInput::make('price')->value(
            fn (FormData $data): string => (string) $data->get('suggested_price', ''),
            editable: true,
            resetOn: ['product'],
            refreshOn: ['@customer'],
        ),
    );

    expect($wire['props'])->toMatchArray([
        'editablePrefill' => true,
        'prefillResetOn' => ['product'],
        'prefillRefreshOn' => ['@customer'],
    ])->not->toHaveKey('prefill');
});
