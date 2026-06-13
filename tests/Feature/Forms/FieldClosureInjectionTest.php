<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Support\Evaluation\UnresolvableEvaluationParameter;

it('injects named utilities into rule closures', function () {
    $field = TextInput::make('email')->rules(fn ($get) => $get('strict') ? ['email'] : []);

    expect($field->resolveRules(FormData::make(['strict' => true]), Request::create('/')))->toBe(['email']);
});

it('injects the field component and its own value into rule closures', function () {
    $field = TextInput::make('email')->rules(fn ($component, $value) => [$component->name().':'.$value]);

    expect($field->resolveRules(FormData::make(['email' => 'a@b.c']), Request::create('/')))->toBe(['email:a@b.c']);
});

it('keeps supporting typed FormData and Request rule closures', function () {
    $field = TextInput::make('age')->rules(fn (FormData $state, Request $request) => [$state->string('extra')]);

    expect($field->resolveRules(FormData::make(['extra' => 'min:3']), Request::create('/')))->toBe(['min:3']);
});

it('injects named utilities into computed value resolvers', function () {
    $field = TextInput::make('total')
        ->value(fn ($get) => $get('qty') * 2);

    $field->applyResolution(FormData::make(['qty' => 5]), Request::create('/'));

    expect($field->resolvedValue())->toBe(10);
});

it('injects named utilities into dependsOn callbacks', function () {
    $field = TextInput::make('city')
        ->dependsOn('country', fn ($component, $get) => $component->value($get('country').'-city'));

    $field->applyResolution(FormData::make(['country' => 'de']), Request::create('/'));

    expect($field->resolvedValue())->toBe('de-city');
});

it('injects row and form scopes into prefill resolvers by name', function () {
    $field = TextInput::make('label')
        ->value(fn ($form, $row) => $row->string('first').'@'.$form->string('domain'), editable: true);

    $row = FormData::make(['first' => 'ada']);
    $form = FormData::make(['domain' => 'lattice.dev']);

    expect($field->resolvePrefillValue($row, $form, Request::create('/')))->toBe('ada@lattice.dev');
});

it('resolves a typed FormData prefill parameter to the row scope', function () {
    $field = TextInput::make('label')
        ->value(fn (FormData $data) => $data->string('first'), editable: true);

    $row = FormData::make(['first' => 'ada']);
    $form = FormData::make(['first' => 'grace']);

    expect($field->resolvePrefillValue($row, $form, Request::create('/')))->toBe('ada');
});

it('resolves a concrete field-typed parameter to the live component', function () {
    $field = TextInput::make('total')->value(fn (TextInput $self) => $self->name());

    $field->applyResolution(FormData::make([]), Request::create('/'));

    expect($field->resolvedValue())->toBe('total');
});

it('resolves an abstract Field-typed parameter to the live component', function () {
    $field = TextInput::make('total')->value(fn (Field $self) => $self->name());

    $field->applyResolution(FormData::make([]), Request::create('/'));

    expect($field->resolvedValue())->toBe('total');
});

it('throws instead of autowiring a mismatched component type', function () {
    $field = TextInput::make('total')->value(fn (Select $other) => $other);

    expect(fn () => $field->applyResolution(FormData::make([]), Request::create('/')))
        ->toThrow(UnresolvableEvaluationParameter::class);
});
