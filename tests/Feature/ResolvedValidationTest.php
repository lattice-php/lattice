<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function resolvedDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('mode', 'Mode'),
                TextInput::make('secret', 'Secret')
                    ->dependsOn('mode', fn (TextInput $f, FormData $d) => $d->get('mode') === 'reveal'
                        ? $f->visible()->rules(['required', 'string'])
                        : $f->hidden()),
                TextInput::make('qty', 'Qty'),
                TextInput::make('price', 'Price'),
                TextInput::make('total', 'Total')
                    ->value(fn (FormData $d) => $d->float('qty') * $d->float('price')),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('skips validation for a field hidden by a closure', function (): void {
    $validated = resolvedDefinition()->validate(Request::create('/', 'POST', ['mode' => 'closed']));

    expect($validated)->not->toHaveKey('secret');
});

it('applies rules set inside a dependsOn closure', function (): void {
    expect(fn () => resolvedDefinition()->validate(Request::create('/', 'POST', ['mode' => 'reveal'])))
        ->toThrow(ValidationException::class);
});

it('uses the server-computed value, not the submitted one', function (): void {
    $validated = resolvedDefinition()->validate(Request::create('/', 'POST', [
        'mode' => 'closed',
        'qty' => '3',
        'price' => '4',
        'total' => '999',
    ]));

    expect($validated['total'])->toBe(12.0);
});

function lockedDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('display', 'Display')->readOnly()->rules(['string']),
                TextInput::make('locked', 'Locked')->readOnly()->value('server')->rules(['string']),
                TextInput::make('off', 'Off')->disabled()->rules(['string']),
                TextInput::make('name', 'Name')->rules(['required', 'string']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('drops readonly and disabled values that have no field value', function (): void {
    $validated = lockedDefinition()->validate(Request::create('/', 'POST', [
        'display' => 'hacked',
        'locked' => 'tampered',
        'off' => 'hacked',
        'name' => 'Ada',
    ]));

    expect($validated)->not->toHaveKey('display')
        ->and($validated)->not->toHaveKey('off')
        ->and($validated['locked'])->toBe('server')
        ->and($validated['name'])->toBe('Ada');
});
