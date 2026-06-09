<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Form\Checkbox;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\DateInput;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
use Bambamboole\Lattice\Components\Form\HiddenInput;
use Bambamboole\Lattice\Components\Form\NumberInput;
use Bambamboole\Lattice\Components\Form\PasswordInput;
use Bambamboole\Lattice\Components\Form\RichEditor;
use Bambamboole\Lattice\Components\Form\Textarea;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Forms\FormData;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.showcase.form')]
class ShowcaseForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(500)
            ->submitLabel('Submit showcase')
            ->schema([
                Heading::make('Profile', 2),
                TextInput::make('name', 'Full name')
                    ->placeholder('Ada Lovelace')
                    ->rules(['required', 'string', 'max:255']),
                TextInput::make('email', 'Email')
                    ->email()
                    ->placeholder('ada@example.com')
                    ->rules(['required', 'email']),
                PasswordInput::make('password', 'Password')
                    ->needsConfirmation()
                    ->rules(['required', 'string', 'min:8', 'confirmed']),
                Textarea::make('bio', 'Bio')
                    ->rows(4)
                    ->placeholder('Tell us about yourself')
                    ->rules(['nullable', 'string', 'max:1000']),

                Heading::make('Details', 2),
                NumberInput::make('age', 'Age')
                    ->min(0)
                    ->max(120)
                    ->rules(['nullable', 'integer', 'min:0', 'max:120']),
                NumberInput::make('satisfaction', 'Satisfaction')
                    ->slider()
                    ->min(0)
                    ->max(10),
                DateInput::make('birthday', 'Birthday')
                    ->max('2026-01-01')
                    ->rules(['nullable', 'date']),
                Choice::make('plan', 'Plan')
                    ->options([
                        Choice::option('Free', 'free'),
                        Choice::option('Pro', 'pro'),
                        Choice::option('Enterprise', 'enterprise'),
                    ])
                    ->rules(['required', Rule::in(['free', 'pro', 'enterprise'])]),

                Heading::make('Conditional fields', 2),
                Choice::make('account_type', 'Account type')
                    ->options([
                        Choice::option('Personal', 'personal'),
                        Choice::option('Business', 'business'),
                    ]),
                TextInput::make('company', 'Company')
                    ->dependsOn('account_type', 'business')
                    ->requiredWhen('account_type', 'business')
                    ->rules(['string', 'max:255']),

                Heading::make('Computed total', 2),
                NumberInput::make('quantity', 'Quantity')->min(1),
                NumberInput::make('unit_price', 'Unit price')->min(0)->step(0.01),
                TextInput::make('total', 'Total')
                    ->readonly()
                    ->value(fn (FormData $data) => $data->float('quantity') * $data->float('unit_price')),

                Heading::make('Rich content', 2),
                RichEditor::make('article', 'Article'),

                Checkbox::make('newsletter', 'Subscribe to the newsletter'),
                Checkbox::make('terms', 'I accept the terms and conditions')
                    ->rules(['accepted']),

                HiddenInput::make('source', 'workbench-showcase'),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/showcase');
    }
}
