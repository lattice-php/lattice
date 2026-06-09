<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Core\Card;
use Bambamboole\Lattice\Components\Core\Grid;
use Bambamboole\Lattice\Components\Form\Checkbox;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\DateInput;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
use Bambamboole\Lattice\Components\Form\HiddenInput;
use Bambamboole\Lattice\Components\Form\NumberInput;
use Bambamboole\Lattice\Components\Form\PasswordInput;
use Bambamboole\Lattice\Components\Form\RichEditor;
use Bambamboole\Lattice\Components\Form\Select;
use Bambamboole\Lattice\Components\Form\Textarea;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Forms\FormData;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

#[Form('workbench.showcase.form')]
class ShowcaseForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(500)
            ->submitLabel('Submit showcase')
            ->schema([
                Card::make('Profile', 'Your basic account information.')->children([
                    Grid::make()->columns(2)->children([
                        TextInput::make('name', 'Full name')
                            ->placeholder('Ada Lovelace')
                            ->rules(['required', 'string', 'max:255']),
                        TextInput::make('email', 'Email')
                            ->email()
                            ->placeholder('ada@example.com')
                            ->rules(['required']),
                    ]),
                    PasswordInput::make('password', 'Password')
                        ->needsConfirmation()
                        ->rules(['required', 'string', 'min:8', 'confirmed']),
                    Textarea::make('bio', 'Bio')
                        ->rows(4)
                        ->placeholder('Tell us about yourself')
                        ->rules(['nullable', 'string', 'max:1000']),
                ]),

                Card::make('Details')->children([
                    Grid::make()->columns(2)->children([
                        NumberInput::make('age', 'Age')
                            ->min(0)
                            ->max(120)
                            ->rules(['nullable', 'integer', 'min:0', 'max:120']),
                        DateInput::make('birthday', 'Birthday')
                            ->max('2026-01-01')
                            ->rules(['nullable', 'date']),
                    ]),
                    NumberInput::make('satisfaction', 'Satisfaction')
                        ->slider()
                        ->min(0)
                        ->max(10),
                    Choice::make('plan', 'Plan')
                        ->options([
                            Choice::option('Free', 'free'),
                            Choice::option('Pro', 'pro'),
                            Choice::option('Enterprise', 'enterprise'),
                        ])
                        ->rules(['required', Rule::in(['free', 'pro', 'enterprise'])]),
                ]),

                Card::make('Conditional fields', 'The company field appears for business accounts.')->children([
                    Choice::make('account_type', 'Account type')
                        ->options([
                            Choice::option('Personal', 'personal'),
                            Choice::option('Business', 'business'),
                        ]),
                    TextInput::make('company', 'Company')
                        ->dependsOn('account_type', 'business')
                        ->requiredWhen('account_type', 'business')
                        ->rules(['string', 'max:255']),
                ]),

                Card::make('Order total', 'The total is computed on the server.')->children([
                    Grid::make()->columns(2)->children([
                        NumberInput::make('quantity', 'Quantity')->min(1),
                        NumberInput::make('unit_price', 'Unit price')->min(0)->step(0.01),
                    ]),
                    TextInput::make('total', 'Total')
                        ->readonly()
                        ->dependsOn(
                            ['quantity', 'unit_price'],
                            fn (TextInput $field, FormData $data) => $field->value(
                                $data->float('quantity') * $data->float('unit_price'),
                            ),
                        ),
                ]),

                Card::make('Selection', 'Static and searchable selects.')->children([
                    Select::make('country', 'Country')
                        ->placeholder('Pick a country')
                        ->options([
                            Select::option('Germany', 'de'),
                            Select::option('France', 'fr'),
                            Select::option('Spain', 'es'),
                            Select::option('Italy', 'it'),
                        ])
                        ->rules(['nullable', 'string']),
                    Select::make('related_products', 'Related products')
                        ->multiple()
                        ->placeholder('Search products…')
                        ->searchable(fn (string $query) => Product::query()
                            ->where('name', 'like', "%{$query}%")
                            ->orderBy('name')
                            ->limit(10)
                            ->get()
                            ->map(fn (Product $product) => Select::option($product->name, (string) $product->id))
                            ->all())
                        ->rules(['nullable', 'array']),
                ]),

                Card::make('Article')->children([
                    RichEditor::make('article', 'Article'),
                ]),

                Card::make('Consent')->children([
                    Checkbox::make('newsletter', 'Subscribe to the newsletter'),
                    Checkbox::make('terms', 'I accept the terms and conditions')
                        ->rules(['accepted']),
                ]),

                HiddenInput::make('source', 'workbench-showcase'),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/showcase');
    }
}
