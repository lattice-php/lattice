<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Choice;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
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

    public function handle(): Response
    {
        return redirect('/form/fields/choice');
    }
}
