<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\TextInput;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

function emailDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('email', 'Email')->email()->rules(['required']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('rejects a non-fully-qualified email when email() is used', function (): void {
    expect(fn () => emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'a@a'])))
        ->toThrow(ValidationException::class);
});

it('accepts a proper email when email() is used', function (): void {
    $validated = emailDefinition()->validate(Request::create('/', 'POST', ['email' => 'ada@example.com']));

    expect($validated)->toMatchArray(['email' => 'ada@example.com']);
});
