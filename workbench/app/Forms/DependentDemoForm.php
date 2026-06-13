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
                Card::make(__('workbench.forms.dependent.account'))->schema([
                    Choice::make('type', __('workbench.forms.dependent.type'))->options([
                        Choice::option(__('workbench.forms.dependent.personal'), 'personal'),
                        Choice::option(__('workbench.forms.dependent.business'), 'business'),
                    ]),
                    TextInput::make('company', __('workbench.forms.dependent.company'))
                        ->dependsOn('type', 'business')
                        ->requiredWhen('type', 'business')
                        ->rules(['string', 'max:255']),
                ]),
                Card::make(__('workbench.forms.dependent.order'))->schema([
                    Grid::make()->columns(2)->schema([
                        NumberInput::make('qty', __('workbench.common.qty'))->min(0),
                        NumberInput::make('unit_price', __('workbench.common.unitPrice'))->min(0)->step(0.01),
                    ]),
                    TextInput::make('total', __('workbench.forms.dependent.total'))
                        ->readOnly()
                        ->value(fn (FormData $data) => $data->float('qty') * $data->float('unit_price')),
                    NumberInput::make('level', __('workbench.forms.dependent.level'))->slider()->min(0)->max(10),
                    DateInput::make('due', __('workbench.forms.dependent.dueDate')),
                ]),
                Card::make(__('workbench.forms.dependent.content'))->schema([
                    Textarea::make('bio', __('workbench.common.bio'))->rows(4)->rules(['nullable', 'string', 'max:500']),
                    RichEditor::make('article', __('workbench.common.article')),
                ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/dependent-demo');
    }
}
