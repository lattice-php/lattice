<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

function computedDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
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

it('resolves computed field values', function (): void {
    $result = computedDefinition()->resolveFields(Request::create('/', 'POST', ['qty' => '3', 'price' => '4']));

    expect($result['values'])->toBe(['total' => 12.0])
        ->and($result['fields'])->toHaveKey('total');
});
