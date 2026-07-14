<?php
declare(strict_types=1);

namespace Workbench\App\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.dependent.form')]
class DependentFieldsForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->precognitive(300)
            ->schema([
                Tabs::make('dependent-variants')
                    ->queryKey('type')
                    ->orientation(Orientation::Vertical)
                    ->defaultValue('conditional')
                    ->schema([
                        Tab::make('conditional', __('workbench.forms.dependent.conditional'))->schema([
                            Choice::make('type', __('workbench.forms.dependent.type'))->options([
                                Choice::option(__('workbench.forms.dependent.personal'), 'personal'),
                                Choice::option(__('workbench.forms.dependent.business'), 'business'),
                            ]),
                            TextInput::make('company', __('workbench.forms.dependent.company'))
                                ->dependsOn('type', 'business')
                                ->requiredWhen('type', 'business')
                                ->rules(['string', 'max:255']),
                        ]),
                        Tab::make('computed', __('workbench.forms.dependent.computed'))->schema([
                            Grid::make()->columns(2)->schema([
                                NumberInput::make('qty', __('workbench.common.qty'))->min(0),
                                NumberInput::make('unit_price', __('workbench.common.unit-price'))->min(0)->step(0.01),
                            ]),
                            TextInput::make('total', __('workbench.forms.dependent.total'))
                                ->readOnly()
                                ->value(fn (FormData $data): float => $data->float('qty') * $data->float('unit_price')),
                        ]),
                    ]),
            ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/dependent');
    }
}
