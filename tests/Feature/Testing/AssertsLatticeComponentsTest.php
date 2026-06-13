<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
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
