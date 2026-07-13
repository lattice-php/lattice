<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Forms\Components\Checkbox;
use Lattice\Lattice\Forms\Components\Form as FormComponent;
use Lattice\Lattice\Forms\Components\Toggle;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Enums\Orientation;
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

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/boolean');
    }
}
