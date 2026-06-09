<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Components\Choice;
use Bambamboole\Lattice\Forms\Components\TextInput;
use Bambamboole\Lattice\Forms\FormData;
use Illuminate\Http\Request;

it('serializes dependsOn keys and the any-change marker', function (): void {
    $optionsProps = Choice::make('state', 'State')
        ->dependsOn('country', fn (Choice $f, FormData $d) => $f)
        ->toArray()['props'];

    $valueProps = TextInput::make('total', 'Total')
        ->value(fn (FormData $d) => $d->float('qty'))
        ->toArray()['props'];

    expect($optionsProps['dependsOnKeys'])->toBe(['country'])
        ->and($valueProps['dependsOnAny'])->toBeTrue();
});

it('resolves a value closure during resolution', function (): void {
    $field = TextInput::make('total', 'Total')
        ->value(fn (FormData $d) => $d->float('qty') * $d->float('price'));

    $field->applyResolution(FormData::make(['qty' => '3', 'price' => '4']), Request::create('/'));

    expect($field->hasResolvedValue())->toBeTrue()
        ->and($field->resolvedValue())->toBe(12.0)
        ->and($field->toArray()['props']['value'])->toBe(12.0);
});

it('runs dependsOn closures during resolution', function (): void {
    $field = Choice::make('state', 'State')
        ->dependsOn('country', fn (Choice $f, FormData $d) => $f->options([
            Choice::option(ucfirst((string) $d->get('country')), (string) $d->get('country')),
        ]));

    $field->applyResolution(FormData::make(['country' => 'germany']), Request::create('/'));

    expect($field->toArray()['props']['options'])->toBe([['label' => 'Germany', 'value' => 'germany']]);
});
