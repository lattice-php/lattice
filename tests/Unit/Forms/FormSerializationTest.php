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

test('forms can disable their default submit button', function () {
    expect(wire(Form::make('profile-form')->withoutSubmitButton()))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'props' => [
                'submitButton' => false,
                'action' => null,
                'method' => null,
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => null,
                'validationTimeout' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'errorBag' => null,
                'state' => [],
                'ref' => null,
            ],
        ]);
});

test('password inputs can request automatic confirmation fields', function () {
    expect(wire(PasswordInput::make('password', 'Password')
        ->required()
        ->passwordRules('minlength:8')
        ->needsConfirmation()))
        ->toMatchArray([
            'type' => 'form.password-input',
            'props' => [
                'confirmation' => [
                    'label' => 'Confirm password',
                    'name' => 'password_confirmation',
                    'placeholder' => 'Confirm password',
                ],
                'label' => 'Password',
                'helperText' => null,
                'name' => 'password',
                'passwordRules' => 'minlength:8',
                'required' => true,
                'labelAction' => null,
                'value' => null,
                'hidden' => null,
                'readOnly' => null,
                'disabled' => null,
                'conditions' => null,
                'dependsOnKeys' => null,
                'dependsOnAny' => null,
                'prefill' => null,
                'prefillResetOn' => null,
                'prefillRefreshOn' => null,
                'autoComplete' => null,
                'autoFocus' => null,
                'placeholder' => null,
                'tabIndex' => null,
            ],
        ]);
});
