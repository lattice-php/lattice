<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
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
                TextInput::make('qty', 'Qty'),
                TextInput::make('unit_price', 'Unit price'),
                TextInput::make('total', 'Total')
                    ->readonly()
                    ->value(fn (FormData $data) => $data->float('qty') * $data->float('unit_price')),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/dependent-demo');
    }
}
