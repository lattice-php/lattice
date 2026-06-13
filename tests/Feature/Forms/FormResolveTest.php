<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
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

function pricingDefinition(): FormDefinition
{
    return new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                TextInput::make('customer', 'Customer'),
                Builder::make('items', 'Line items')->blocks([
                    Block::make('product')->label('Product')->schema([
                        TextInput::make('product', 'Product'),
                        TextInput::make('price', 'Price')->value(
                            fn (FormData $row, FormData $f) => $row->float('product') * ($f->string('customer') === 'vip' ? 0.5 : 1.0),
                            editable: true,
                            resetOn: ['product'],
                            refreshOn: ['@customer'],
                        ),
                    ]),
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

it('resolves row prefill values keyed by full path, reading a form-level field', function (): void {
    $result = pricingDefinition()->resolveFields(Request::create('/', 'POST', [
        'customer' => 'vip',
        'items' => [
            ['type' => 'product', 'product' => '100'],
            ['type' => 'product', 'product' => '40'],
        ],
    ]));

    expect($result['prefill'])->toBe([
        'items.0.price' => 50.0,
        'items.1.price' => 20.0,
    ]);
});

it('emits no prefill for an unknown row type', function (): void {
    $result = pricingDefinition()->resolveFields(Request::create('/', 'POST', [
        'customer' => 'vip',
        'items' => [['type' => 'mystery', 'product' => '100']],
    ]));

    expect($result['prefill'])->toBe([]);
});

it('resolves repeater row prefill values from the fixed schema', function (): void {
    $definition = new class extends FormDefinition
    {
        public function definition(Form $form, Request $request): Form
        {
            return $form->schema([
                Repeater::make('lines', 'Lines')->schema([
                    TextInput::make('base', 'Base'),
                    TextInput::make('doubled', 'Doubled')->value(
                        fn (FormData $row, FormData $f) => $row->float('base') * 2,
                        editable: true,
                        resetOn: ['base'],
                    ),
                ]),
            ]);
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };

    $result = $definition->resolveFields(Request::create('/', 'POST', [
        'lines' => [['base' => '5'], ['base' => '8']],
    ]));

    expect($result['prefill'])->toBe([
        'lines.0.doubled' => 10.0,
        'lines.1.doubled' => 16.0,
    ]);
});
