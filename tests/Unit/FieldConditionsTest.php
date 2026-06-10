<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

it('serializes declarative conditions into props', function (): void {
    $props = wire(TextInput::make('company', 'Company')
        ->dependsOn('type', 'business')
        ->requiredWhen('type', 'business'))['props'];

    expect($props['conditions']['visible'])->toBe([
        ['field' => 'type', 'operator' => 'eq', 'value' => 'business'],
    ])->and($props['conditions']['required'])->toBe([
        ['field' => 'type', 'operator' => 'eq', 'value' => 'business'],
    ]);
});

it('supports the operator form and array in', function (): void {
    $props = wire(TextInput::make('x', 'X')
        ->dependsOn('age', 'gte', 18)
        ->disabledWhen('plan', 'in', ['free', 'trial']))['props'];

    expect($props['conditions']['visible'][0])->toBe(['field' => 'age', 'operator' => 'gte', 'value' => 18])
        ->and($props['conditions']['disabled'][0])->toBe(['field' => 'plan', 'operator' => 'in', 'value' => ['free', 'trial']]);
});

it('evaluates visibility and required against data', function (): void {
    $field = TextInput::make('company', 'Company')
        ->dependsOn('type', 'business')
        ->requiredWhen('type', 'business');

    expect($field->isVisible(FormData::make(['type' => 'business'])))->toBeTrue()
        ->and($field->isVisible(FormData::make(['type' => 'personal'])))->toBeFalse()
        ->and($field->isRequired(FormData::make(['type' => 'business'])))->toBeTrue()
        ->and($field->isRequired(FormData::make(['type' => 'personal'])))->toBeFalse();
});

it('treats array value as an in condition', function (): void {
    $field = TextInput::make('x', 'X')->dependsOn('plan', ['free', 'trial']);

    expect(wire($field)['props']['conditions']['visible'][0]['operator'])->toBe('in');
});
