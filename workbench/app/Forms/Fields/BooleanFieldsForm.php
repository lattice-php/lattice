<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Checkbox;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\Toggle;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.boolean.form')]
class BooleanFieldsForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('boolean-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('checkbox')
                ->schema([
                    Tab::make('checkbox', __('workbench.fields.boolean.checkbox'))->schema([
                        Checkbox::make('newsletter', __('workbench.forms.showcase.newsletter')),
                        Checkbox::make('terms', __('workbench.forms.showcase.terms')),
                    ]),
                    Tab::make('toggle', __('workbench.fields.boolean.toggle'))->schema([
                        Toggle::make('marketing_opt_in', __('workbench.forms.showcase.marketing-opt-in.label'))
                            ->helperText(__('workbench.forms.showcase.marketing-opt-in.help-text')),
                    ]),
                ]),
        ]);
    }

    public function handle(): Response
    {
        return redirect('/form/fields/boolean');
    }
}
