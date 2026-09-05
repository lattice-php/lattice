<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\CheckboxGroup;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.checkbox-group.form')]
class CheckboxGroupFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            CheckboxGroup::make('notifications', __('workbench.forms.checkbox-group.notifications'))
                ->helperText(__('workbench.forms.checkbox-group.notifications-help'))
                ->options([
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.product'), 'product'),
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.security'), 'security', tooltip: __('workbench.forms.checkbox-group.security-tooltip')),
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.digest'), 'digest'),
                ]),
            CheckboxGroup::make('permissions', __('workbench.forms.checkbox-group.permissions'))
                ->columns(2)
                ->bulkToggleable()
                ->collapsible()
                ->options([
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.order-view'), 'order:view', description: 'order:view', group: __('workbench.forms.checkbox-group.sales')),
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.order-manage'), 'order:manage', description: 'order:manage', group: __('workbench.forms.checkbox-group.sales')),
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.invoice-view'), 'invoice:view', description: 'invoice:view', group: __('workbench.forms.checkbox-group.accounting')),
                    CheckboxGroup::option(__('workbench.forms.checkbox-group.invoice-manage'), 'invoice:manage', description: 'invoice:manage', group: __('workbench.forms.checkbox-group.accounting')),
                ]),
        ]);
    }

    public function handle(): Response
    {
        return redirect('/form/fields/checkbox-group');
    }
}
