<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Support\Testing\Assertions\FieldAssertions;
use Lattice\Lattice\Support\Testing\Assertions\FormAssertions;
use Lattice\Lattice\Support\Testing\AssertsLatticeComponents;
use PHPUnit\Framework\AssertionFailedError;

uses(AssertsLatticeComponents::class);

it('navigates a built form and asserts page rendering by visibility', function (): void {
    $form = Form::make('create')->action('/products')->schema([
        TextInput::make('email')->label('Email'),
    ]);

    $this->assertLatticeComponent($form)
        ->assertRendered('form:create')
        ->assertNotRendered('form:missing')
        ->assertRenderedCount('form', 1)
        ->assertHasForm('create');
});

it('fails with a helpful message when a selector is not rendered', function (): void {
    $form = Form::make('create')->schema([]);

    expect(fn () => $this->assertLatticeComponent($form)->assertRendered('table:products'))
        ->toThrow(AssertionFailedError::class, 'table:products');
});

it('asserts field visibility, conditions and initial value', function (): void {
    $form = Form::make('create')
        ->action('/products')
        ->fill(['email' => 'a@b.c'])
        ->schema([
            TextInput::make('email')->label('Email'),
            TextInput::make('company')->visibleWhen('type', 'business'),
            TextInput::make('secret')->hidden(),
        ]);

    $this->assertLatticeComponent($form)
        ->form('create', fn (FormAssertions $form) => $form
            ->assertSubmitsTo('/products')
            ->assertHasField('email')
            ->assertMissingField('nope')
            ->field('email', fn (FieldAssertions $f) => $f
                ->assertVisible()
                ->assertInitialValue('a@b.c'))
            ->field('company', fn (FieldAssertions $f) => $f
                ->assertVisibleWhen(['type' => 'business'])
                ->assertHiddenWhen(['type' => 'personal'])
                ->assertHasCondition('visible', 'type', Op::Equals, 'business'))
            ->field('secret', fn (FieldAssertions $f) => $f->assertHidden()));
});
