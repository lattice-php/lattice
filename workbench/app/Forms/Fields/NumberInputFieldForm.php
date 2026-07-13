<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\NumberInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.number.form')]
class NumberInputFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('number-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('basic')
                ->schema([
                    Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                        NumberInput::make('age', __('workbench.forms.showcase.age'))
                            ->min(0)
                            ->max(120)
                            ->rules(['nullable', 'integer', 'min:0', 'max:120']),
                    ]),
                    Tab::make('slider', __('workbench.fields.number.slider'))->schema([
                        NumberInput::make('satisfaction', __('workbench.forms.showcase.satisfaction'))
                            ->slider()
                            ->min(0)
                            ->max(10),
                    ]),
                    Tab::make('affixes', __('workbench.fields.variants.affixes'))->schema([
                        NumberInput::make('amount', __('workbench.common.unit-price'))
                            ->min(0)
                            ->step(0.01)
                            ->prefix('$')
                            ->suffix('USD'),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/number');
    }
}
