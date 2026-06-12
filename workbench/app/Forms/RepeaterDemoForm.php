<?php

declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[Form('workbench.repeater.form')]
class RepeaterDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make('Line items')->schema([
                    Repeater::make('items', 'Line items')
                        ->schema([
                            TextInput::make('name', 'Name')->required(),
                            TextInput::make('qty', 'Qty')->rules(['numeric']),
                        ])
                        ->minItems(1)
                        ->maxItems(3)
                        ->addLabel('Add line')
                        ->defaultItems(1),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/repeater');
    }
}
