<?php
declare(strict_types=1);

namespace Workbench\App\Forms\Fields;

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\PasswordInput;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Enums\Orientation;
use Symfony\Component\HttpFoundation\Response;

#[AsForm('workbench.fields.password.form')]
class PasswordFieldForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Tabs::make('password-variants')
                ->queryKey('type')
                ->orientation(Orientation::Vertical)
                ->defaultValue('basic')
                ->schema([
                    Tab::make('basic', __('workbench.fields.variants.basic'))->schema([
                        PasswordInput::make('secret', __('workbench.forms.showcase.password'))
                            ->rules(['nullable', 'string', 'min:8']),
                    ]),
                    Tab::make('confirmation', __('workbench.fields.password.confirmation'))->schema([
                        PasswordInput::make('password', __('workbench.forms.showcase.password'))
                            ->needsConfirmation()
                            ->rules(['nullable', 'string', 'min:8', 'confirmed']),
                    ]),
                ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $this->validate($request);

        return redirect('/form/fields/password');
    }
}
