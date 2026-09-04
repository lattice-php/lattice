<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Form\Components\Checkbox;
use Lattice\Form\Components\Select;
use Lattice\Form\FormDefinition;

function ruleLessFieldsDefinition(): FormDefinition
{
    return testFormDefinition(fn (): array => [
        Select::make('country', 'Country')->options([
            Select::option('Germany', 'de'),
            Select::option('France', 'fr'),
        ]),
        Checkbox::make('subscribed', 'Subscribed'),
    ]);
}

it('keeps a rule-less select in the validated payload', function (): void {
    $validated = ruleLessFieldsDefinition()->validate(Request::create('/', 'POST', [
        'country' => 'de',
        'subscribed' => true,
    ]));

    expect($validated)->toHaveKey('country')
        ->and($validated['country'])->toBe('de');
});

it('keeps a rule-less checkbox in the validated payload as a real bool', function (): void {
    $validated = ruleLessFieldsDefinition()->validate(Request::create('/', 'POST', [
        'country' => 'de',
        'subscribed' => true,
    ]));

    expect($validated)->toHaveKey('subscribed')
        ->and($validated['subscribed'])->toBeTrue();
});

it('casts an unchecked checkbox to false rather than dropping it', function (): void {
    $validated = ruleLessFieldsDefinition()->validate(Request::create('/', 'POST', [
        'country' => 'de',
        'subscribed' => false,
    ]));

    expect($validated)->toHaveKey('subscribed')
        ->and($validated['subscribed'])->toBeFalse();
});

it('casts a string "0" checkbox value to a real false rather than a truthy string', function (): void {
    $validated = ruleLessFieldsDefinition()->validate(Request::create('/', 'POST', [
        'country' => 'de',
        'subscribed' => '0',
    ]));

    expect($validated)->toHaveKey('subscribed')
        ->and($validated['subscribed'])->toBeFalse();
});

it('defaults an unchecked checkbox to false when its key is absent from the request entirely', function (): void {
    $validated = ruleLessFieldsDefinition()->validate(Request::create('/', 'POST', [
        'country' => 'de',
    ]));

    expect($validated)->toHaveKey('subscribed')
        ->and($validated['subscribed'])->toBeFalse();
});
