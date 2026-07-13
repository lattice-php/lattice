<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.choice.form')]
class ChoiceFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Choice::make('plan', __('workbench.forms.showcase.plan'))
                ->options([
                    Choice::option(__('workbench.forms.showcase.free'), 'free'),
                    Choice::option(__('workbench.forms.showcase.pro'), 'pro'),
                    Choice::option(__('workbench.forms.showcase.enterprise'), 'enterprise'),
                ])
                ->rules(['nullable', Rule::in(['free', 'pro', 'enterprise'])]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/choice');
    }
}
