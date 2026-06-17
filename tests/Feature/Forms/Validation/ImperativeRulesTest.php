<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function imperativeRulesDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('type', 'Type'),
                TextInput::make('vat_id', 'VAT ID')
                    ->rules(fn (FormData $data): array => $data->get('type') === 'business'
                        ? ['required', 'string']
                        : ['nullable']),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('skips the rule when the closure returns it optional', function (): void {
    $validated = imperativeRulesDefinition()->validate(Request::create('/', 'POST', ['type' => 'personal']));

    expect($validated)->not->toHaveKey('vat_id');
});

it('enforces the rule when the closure makes it required', function (): void {
    expect(fn (): array => imperativeRulesDefinition()->validate(Request::create('/', 'POST', ['type' => 'business'])))
        ->toThrow(ValidationException::class);
});

it('passes when the conditionally required value is provided', function (): void {
    $validated = imperativeRulesDefinition()->validate(Request::create('/', 'POST', [
        'type' => 'business',
        'vat_id' => 'DE123',
    ]));

    expect($validated)->toMatchArray(['vat_id' => 'DE123']);
});
