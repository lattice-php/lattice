<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Card;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.repeater.form')]
class RepeaterDemoForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Card::make(__('workbench.forms.repeater.card'))->schema([
                    Repeater::make('items', __('workbench.common.line-items'))
                        ->schema([
                            TextInput::make('name', __('workbench.common.name'))->required(),
                            TextInput::make('qty', __('workbench.common.qty'))->rules(['numeric']),
                        ])
                        ->minItems(1)
                        ->maxItems(3)
                        ->addLabel(__('workbench.common.add-line'))
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
