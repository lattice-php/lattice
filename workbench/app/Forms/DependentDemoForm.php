<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Core\Components\Card;
use Bambamboole\Lattice\Core\Components\Grid;
use Bambamboole\Lattice\Forms\Components\Choice;
use Bambamboole\Lattice\Forms\Components\DateInput;
use Bambamboole\Lattice\Forms\Components\Form as FormComponent;
use Bambamboole\Lattice\Forms\Components\NumberInput;
use Bambamboole\Lattice\Forms\Components\RichEditor;
use Bambamboole\Lattice\Forms\Components\Textarea;
use Bambamboole\Lattice\Forms\Components\TextInput;
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
                Card::make('Account')->children([
                    Choice::make('type', 'Type')->options([
                        Choice::option('Personal', 'personal'),
                        Choice::option('Business', 'business'),
                    ]),
                    TextInput::make('company', 'Company')
                        ->dependsOn('type', 'business')
                        ->requiredWhen('type', 'business')
                        ->rules(['string', 'max:255']),
                ]),
                Card::make('Order')->children([
                    Grid::make()->columns(2)->children([
                        NumberInput::make('qty', 'Qty')->min(0),
                        NumberInput::make('unit_price', 'Unit price')->min(0)->step(0.01),
                    ]),
                    TextInput::make('total', 'Total')
                        ->readonly()
                        ->value(fn (FormData $data) => $data->float('qty') * $data->float('unit_price')),
                    NumberInput::make('level', 'Level')->slider()->min(0)->max(10),
                    DateInput::make('due', 'Due date'),
                ]),
                Card::make('Content')->children([
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
