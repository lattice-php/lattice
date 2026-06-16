<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\PasswordInput;

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
                'prefill' => false,
                'prefillResetOn' => null,
                'prefillRefreshOn' => null,
                'autoComplete' => null,
                'autoFocus' => false,
                'placeholder' => null,
                'tabIndex' => null,
                'columnWidth' => 'md',
            ],
        ]);
});
