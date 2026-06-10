<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.dependent.form')]
class DependentDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make('Account')->schema([
                    Choice::make('type', 'Type')->options([
                        Choice::option('Personal', 'personal'),
                        Choice::option('Business', 'business'),
                    ]),
                    TextInput::make('company', 'Company')
                        ->dependsOn('type', 'business')
                        ->requiredWhen('type', 'business')
                        ->rules(['string', 'max:255']),
                ]),
                Card::make('Order')->schema([
                    Grid::make()->columns(2)->schema([
                        NumberInput::make('qty', 'Qty')->min(0),
                        NumberInput::make('unit_price', 'Unit price')->min(0)->step(0.01),
                    ]),
                    TextInput::make('total', 'Total')
                        ->readOnly()
                        ->value(fn (FormData $data) => $data->float('qty') * $data->float('unit_price')),
                    NumberInput::make('level', 'Level')->slider()->min(0)->max(10),
                    DateInput::make('due', 'Due date'),
                ]),
                Card::make('Content')->schema([
                    Textarea::make('bio', 'Bio')->rows(4)->rules(['nullable', 'string', 'max:500']),
                    RichEditor::make('article', 'Article'),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/dependent-demo');
    }
}
