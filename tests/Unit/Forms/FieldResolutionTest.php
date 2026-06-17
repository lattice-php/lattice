<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

it('serializes dependsOn keys and the any-change marker', function (): void {
    $optionsProps = wire(Choice::make('state', 'State')
        ->dependsOn('country', fn ($component, FormData $d) => $component))['props'];

    $valueProps = wire(TextInput::make('total', 'Total')
        ->value(fn (FormData $d): float => $d->float('qty')))['props'];

    expect($optionsProps['dependsOnKeys'])->toBe(['country'])
        ->and($valueProps['dependsOnAny'])->toBeTrue();
});

it('resolves a value closure during resolution', function (): void {
    $field = TextInput::make('total', 'Total')
        ->value(fn (FormData $d): float => $d->float('qty') * $d->float('price'));

    $field->applyResolution(FormData::make(['qty' => '3', 'price' => '4']), Request::create('/'));

    expect($field->hasResolvedValue())->toBeTrue()
        ->and($field->resolvedValue())->toBe(12.0)
        ->and(wire($field)['props']['value'])->toEqual(12.0);
});

it('marks a value set inside a dependsOn closure as resolved', function (): void {
    $field = TextInput::make('total', 'Total')
        ->dependsOn(
            ['qty', 'price'],
            fn ($component, FormData $d) => $component->value($d->float('qty') * $d->float('price')),
        );

    $field->applyResolution(FormData::make(['qty' => '4', 'price' => '5']), Request::create('/'));

    expect($field->hasResolvedValue())->toBeTrue()
        ->and($field->resolvedValue())->toBe(20.0);
});

it('runs dependsOn closures during resolution', function (): void {
    $field = Choice::make('state', 'State')
        ->dependsOn('country', fn ($component, FormData $d) => $component->options([
            Choice::option(ucfirst((string) $d->get('country')), (string) $d->get('country')),
        ]));

    $field->applyResolution(FormData::make(['country' => 'germany']), Request::create('/'));

    expect(wire($field)['props']['options'])->toBe([['label' => 'Germany', 'value' => 'germany']]);
});

it('stores an editable computed default without making the field server-authoritative', function (): void {
    $field = TextInput::make('price')->value(
        fn (FormData $row, FormData $form): float => 42.0,
        editable: true,
        resetOn: ['product'],
        refreshOn: ['@customer'],
    );

    expect($field->hasPrefill())->toBeTrue()
        ->and($field->isComputed())->toBeFalse()
        ->and($field->hasResolvedValue())->toBeFalse()
        ->and($field->resolvePrefillValue(
            FormData::make(['product' => 7]),
            FormData::make(['customer' => 'acme']),
            Request::create('/', 'POST'),
        ))->toBe(42.0);
});

it('keeps read-only value(fn) behavior unchanged', function (): void {
    $field = TextInput::make('total')->value(fn (FormData $data): float => 5.0);

    expect($field->isComputed())->toBeTrue()
        ->and($field->hasPrefill())->toBeFalse();
});
