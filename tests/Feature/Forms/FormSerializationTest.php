<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Emphasis;
use Lattice\Lattice\Ui\Enums\Justify;

test('forms serialize schema children like pages', function (): void {
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
                        'color' => null,
                        'copyable' => false,
                    ],
                ],
            ],
        ]);
});

test('password inputs can request automatic confirmation fields', function (): void {
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

test('editable computed fields serialize an explicit client prefill flag', function (): void {
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

test('forms serialize submit row configuration', function (): void {
    $wire = wire(Form::make('checkout')
        ->submitJustify(Justify::Between)
        ->submitEmphasis(Emphasis::Outline)
        ->submitButtons(
            Button::make('Cancel'),
            Button::make('Save')->submit(),
        ));

    expect($wire['props'])->toMatchArray([
        'submitJustify' => 'between',
        'submitEmphasis' => 'outline',
    ])
        ->and($wire['props']['submitButtons'])->toHaveCount(2)
        ->and($wire['props']['submitButtons'][0])->toMatchArray(['type' => 'button'])
        ->and($wire['props']['submitButtons'][1]['props'])->toMatchArray(['buttonType' => 'submit']);
});
