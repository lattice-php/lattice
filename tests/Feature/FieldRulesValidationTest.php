<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function stubDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('name', 'Name')->rules(['required', 'string']),
                TextInput::make('price', 'Price')->rules(['required', 'numeric']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('derives validation rules from fields and fails an empty payload', function (): void {
    $definition = stubDefinition();

    expect(fn () => $definition->validate(Request::create('/', 'POST', [])))
        ->toThrow(ValidationException::class);
});

it('passes validation with a valid payload', function (): void {
    $definition = stubDefinition();

    $validated = $definition->validate(Request::create('/', 'POST', [
        'name' => 'Desk Lamp',
        'price' => '49.99',
    ]));

    expect($validated)->toMatchArray(['name' => 'Desk Lamp', 'price' => '49.99']);
});
