<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

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
