<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\TextInput;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

function messagesDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('company', 'Company')->rules(['required']),
                TextInput::make('vat_id', 'VAT ID')
                    ->rules(['required'])
                    ->message('required', 'We need your VAT ID.'),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

/**
 * @param  array<string, mixed>  $payload
 * @return array<string, array<int, string>>
 */
function errorsFor(array $payload): array
{
    try {
        messagesDefinition()->validate(Request::create('/', 'POST', $payload));
    } catch (ValidationException $exception) {
        return $exception->errors();
    }

    return [];
}

it('uses the field label as the validation attribute name', function (): void {
    expect(errorsFor([])['company'][0])->toBe('The Company field is required.');
});

it('uses a per-field custom validation message', function (): void {
    expect(errorsFor([])['vat_id'][0])->toBe('We need your VAT ID.');
});
