<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Forms\FormData;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
                        ? $f->show()->rules(['required', 'string'])
                        : $f->hide()),
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
