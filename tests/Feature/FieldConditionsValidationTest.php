<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Components\Choice;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\TextInput;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

function conditionalDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                Choice::make('type', 'Type')->options([
                    Choice::option('Personal', 'personal'),
                    Choice::option('Business', 'business'),
                ]),
                TextInput::make('company', 'Company')
                    ->dependsOn('type', 'business')
                    ->requiredWhen('type', 'business')
                    ->rules(['string']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('skips hidden field rules', function (): void {
    $validated = conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'personal']));

    expect($validated)->not->toHaveKey('company');
});

it('requires the field when its condition matches', function (): void {
    expect(fn () => conditionalDefinition()->validate(Request::create('/', 'POST', ['type' => 'business'])))
        ->toThrow(ValidationException::class);
});
