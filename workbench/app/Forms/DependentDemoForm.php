<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\DateInput;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
use Bambamboole\Lattice\Components\Form\NumberInput;
use Bambamboole\Lattice\Components\Form\Textarea;
use Bambamboole\Lattice\Components\Form\TextInput;
use Bambamboole\Lattice\Forms\FormData;
use Bambamboole\Lattice\Forms\FormDefinition;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.dependent.form')]
class DependentDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Choice::make('type', 'Type')->options([
                    Choice::option('Personal', 'personal'),
                    Choice::option('Business', 'business'),
                ]),
                TextInput::make('company', 'Company')
                    ->dependsOn('type', 'business')
                    ->requiredWhen('type', 'business')
                    ->rules(['string', 'max:255']),
                NumberInput::make('qty', 'Qty')->min(0),
                NumberInput::make('unit_price', 'Unit price')->min(0)->step(0.01),
                TextInput::make('total', 'Total')
                    ->readonly()
                    ->value(fn (FormData $data) => $data->float('qty') * $data->float('unit_price')),
                NumberInput::make('level', 'Level')->slider()->min(0)->max(10),
                DateInput::make('due', 'Due date'),
                Textarea::make('bio', 'Bio')->rows(4)->rules(['nullable', 'string', 'max:500']),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/dependent-demo');
    }
}
